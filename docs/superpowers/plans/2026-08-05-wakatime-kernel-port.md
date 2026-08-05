# WakaTime 内核脚本移植 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the wakatime Web Worker's heartbeat/cache/filter logic into a SiYuan kernel plugin (`src/kernel/index.ts`) running in the goja runtime, and switch the frontend to drive it via `this.kernel.rpc`.

**Architecture:** A `KernelWakaTime` class holds all state, wires `siyuan.plugin.lifecycle` (onload/onrunning/onunload), and exposes 6 RPC methods (`onload/unload/restart/updateConfig/addViewEvent/addEditEvent`) via `siyuan.rpc.bind`. Outbound HTTP to wakatime.com goes through `/api/network/forwardProxy` via `siyuan.client.fetch`; local kernel REST (lsNotebooks/getBlockInfo/getHPathByPath) goes through the same `client.fetch`. Offline cache uses `siyuan.storage` through a new `IStorageBackend` interface shared with the worker.

**Tech Stack:** TypeScript, Vite (kernel build mode), SiYuan kernel plugin API (`siyuan/kernel` types from `petal`), goja globals (`setInterval/clearInterval`, `URL`, `Buffer`).

## Global Constraints

- Run package commands with `pnpm -C workspace --filter wakatime run <script>` (per AGENTS.md).
- Repository has **no test suite** (AGENTS.md: "TODO: no repository-wide test script is defined"). Verification per task is `build:kernel` + `lint`, not failing-test-first. Do not invent tests.
- Preserve the dirty worktree; do not revert unrelated local changes (AGENTS.md).
- Use the user's language (Chinese) in code comments where the surrounding code does; the worker file uses bilingual comments — match that.
- `siyuan` is an external (Vite `external`) — kernel code imports types only: `import type * as kernel from "siyuan/kernel"`.
- goja globals available: `setInterval`, `clearInterval`, `setImmediate`, `clearImmediate`, `setTimeout`, `clearTimeout`, `URL`, `URLSearchParams`, `Buffer`, `console`, `JSON`, `Promise`, `Map`, `Set`, `RegExp`, `Date`, `Symbol`, `ArrayBuffer`. **No** `Worker`, `BroadcastChannel`, `fetch`, `XMLHttpRequest`, `process`, `navigator`, `document`, `location`, `btoa`.
- Cache directory for kernel: `.cache` (relative to `data/storage/petal/<name>/`). Worker keeps `temp/.wakatime/cache` unchanged.

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/wakatime/cache.ts` | `WakaTimeCache` + `IStorageBackend` interface, reusable by worker & kernel | Modify |
| `src/workers/wakatime.ts` | Existing worker; only the `WakaTimeCache` construction call changes to inject an SDK adapter | Modify (minimal) |
| `src/constants.ts` | Add `KERNEL_CACHE_PATH` constant | Modify |
| `src/kernel/index.ts` | Kernel plugin: `KernelWakaTime` class, all business logic, RPC methods | Create |
| `src/index.ts` | Frontend: drop `WorkerBridgeMaster`, use `this.kernel.rpc` | Modify |
| `vite.config.ts` | Add `kernel` build mode → `dist/kernel.js` | Modify |
| `package.json` | Add `build:kernel` script; wire into `build`/`build:dev` | Modify |

---

### Task 1: Add `IStorageBackend` to `cache.ts`

**Files:**
- Modify: `workspace/plugins/wakatime/src/wakatime/cache.ts`

**Interfaces:**
- Produces: `IStorageBackend` (new exported interface), `WakaTimeCache` constructor signature change `(backend: IStorageBackend, directory: string, filename?: string)`.
- Consumes: nothing from other tasks.

**Why first:** Task 2 (worker adapter) and Task 5 (kernel adapter) both depend on this interface existing. Landing it first keeps the worker buildable at every commit.

- [ ] **Step 1: Add the interface and change the constructor**

Open `src/wakatime/cache.ts`. Above the `WakaTimeCache` class declaration, add the interface; replace the `client` constructor parameter with `backend: IStorageBackend`; replace all `this.client.*` calls inside the class with `this.backend.*`.

Add the interface (insert after the `TCache<T>` type, before `export class WakaTimeCache`):

```ts
/**
 * 与 SiYuan 存储（文件读写）后端无关的接口。
 * worker 端注入基于 SDK Client 的实现，内核端注入基于 siyuan.storage 的实现。
 * Storage-backend-agnostic interface; the worker injects an SDK-Client adapter,
 * the kernel injects a siyuan.storage adapter.
 */
export interface IStorageBackend {
    putFile(path: string, content: string): Promise<unknown>;
    getFile(path: string): Promise<string>;
    readDir(path: string): Promise<{ name: string; isDir: boolean }[]>;
    removeFile(path: string): Promise<unknown>;
}
```

Replace the constructor (currently):

```ts
    constructor(
        public readonly client: InstanceType<typeof Client>, // 思源客户端
        public readonly directory: string, // 缓存文件目录
        filename?: string,
    ) {
        this.init(filename);
    }
```

with:

```ts
    constructor(
        public readonly backend: IStorageBackend, // 存储后端
        public readonly directory: string, // 缓存文件目录
        filename?: string,
    ) {
        this.init(filename);
    }
```

Then replace every `this.client.` reference inside the class body. There are 6 call sites:

1. `getAllCacheFilePath` → `const files = await this.backend.readDir({ path: directory });` then `files.filter((file) => file.isDir === false)` — note `readDir` now returns `{name,isDir}[]` directly (no `.data`).
2. `getAllCacheFileName` → same as above, `files.filter((file) => file.isDir === false).map(...)`.
3. `load` → `const files = await this.backend.readDir({ path: this.directory });` then `const text = await this.backend.getFile({ path: filepath });`.
4. `remove` → `const files = await this.backend.readDir({ path: this.directory });` then `await this.backend.removeFile({ path: filepath });`.
5. `_save` → `await this.backend.putFile({ path: filepath, file: this.lines.join(terminator) });`.

**Important — argument shape:** the SDK `Client` methods take `{ path }` / `{ path, file }` objects; `siyuan.storage` takes positional strings. The interface contract above takes **positional** `(path, content?)`. The adapters (Tasks 2 & 5) bridge the gap. So in `cache.ts`, call the backend with **positional** args:

- `readDir(path)` — single string, not `{ path }`
- `getFile(path)` — single string
- `removeFile(path)` — single string
- `putFile(path, content)` — two strings

Re-read the whole class after editing and confirm every `this.backend.*` call uses positional args, not object args.

- [ ] **Step 2: Remove the now-unused `Client` type import**

The import `import type { Client } from "@siyuan-community/siyuan-sdk";` is no longer used in `cache.ts`. Delete that line.

- [ ] **Step 3: Verify the worker still type-checks (it will break — that's Task 2)**

Run: `pnpm -C workspace --filter wakatime run build:plugin`
Expected: FAIL — `src/workers/wakatime.ts` passes a `Client` where `IStorageBackend` is now expected. This is the expected breakage; Task 2 fixes it. Do not commit yet.

---

### Task 2: Inject SDK adapter into the worker

**Files:**
- Modify: `workspace/plugins/wakatime/src/workers/wakatime.ts` (only the `WakaTimeCache` construction site + a new local adapter)
- Modify: `workspace/plugins/wakatime/src/wakatime/cache.ts` (only if Step 1 revealed an object-arg call site missed)

**Interfaces:**
- Consumes: `IStorageBackend` from Task 1.
- Produces: a working worker build (`build:workers` passes).

- [ ] **Step 1: Add the SDK adapter near the `WakaTimeCache` construction in the worker**

In `src/workers/wakatime.ts`, find the cache construction (around line 64):

```ts
const cache = new WakaTimeCache(client, CONSTANTS.OFFLINE_CACHE_PATH);
const caches: InstanceType<typeof WakaTimeCache<TCacheDatum>>[] = [];
```

Add an SDK-backed adapter above it and change the construction:

```ts
/* SDK Client 适配器 — 将 siyuan-sdk Client 包装为 IStorageBackend */
const sdkStorageBackend = {
    putFile: (path: string, content: string) => client.putFile({ path, file: content }),
    getFile: (path: string) => client.getFile({ path }, "text"),
    readDir: (path: string) => client.readDir({ path }).then((r) => r.data),
    removeFile: (path: string) => client.removeFile({ path }),
} satisfies import("@/wakatime/cache").IStorageBackend;

const cache = new WakaTimeCache(sdkStorageBackend, CONSTANTS.OFFLINE_CACHE_PATH);
const caches: InstanceType<typeof WakaTimeCache<TCacheDatum>>[] = [];
```

Note: `client.getFile({path}, "text")` returns a string (the worker's `load`/cache code already consumed it as text via `client.getFile({ path: filepath }, "text")`); the adapter must return that string. The `import("@/wakatime/cache").IStorageBackend` inline import type avoids adding a top-level import line — but if eslint flags it, add a normal `import type { IStorageBackend } from "@/wakatime/cache";` at the top instead and use `satisfies IStorageBackend`.

- [ ] **Step 2: Verify the worker builds**

Run: `pnpm -C workspace --filter wakatime run build:workers`
Expected: PASS, `dist/workers/wakatime.js` produced.

- [ ] **Step 3: Lint the two changed files**

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS (0 warnings). If `cache.ts` has unused-import or object-arg errors, fix them.

- [ ] **Step 4: Commit**

```bash
cd workspace/plugins/wakatime
git add src/wakatime/cache.ts src/workers/wakatime.ts
git commit -m "refactor(wakatime): extract IStorageBackend for cache, worker injects SDK adapter

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Add `KERNEL_CACHE_PATH` constant

**Files:**
- Modify: `workspace/plugins/wakatime/src/constants.ts`

**Interfaces:**
- Produces: `CONSTANTS.KERNEL_CACHE_PATH = ".cache"` (string), consumed by Task 5.

- [ ] **Step 1: Add the constant**

In `src/constants.ts`, inside the default-exported object, add a new entry next to `OFFLINE_CACHE_PATH`:

```ts
    OFFLINE_CACHE_PATH: "temp/.wakatime/cache", // 缓存文件目录路径 (worker)
    KERNEL_CACHE_PATH: ".cache", // 内核脚本缓存文件目录路径 (相对 storage 根)
```

- [ ] **Step 2: Verify build still passes**

Run: `pnpm -C workspace --filter wakatime run build:plugin`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd workspace/plugins/wakatime
git add src/constants.ts
git commit -m "feat(wakatime): add KERNEL_CACHE_PATH constant for kernel cache dir

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Add the `kernel` Vite build mode

**Files:**
- Modify: `workspace/plugins/wakatime/vite.config.ts`
- Modify: `workspace/plugins/wakatime/package.json`
- Create (by build): `workspace/plugins/wakatime/src/kernel/index.ts` placeholder so the build has an entry (real content lands in Task 5; but to land build config independently, create a tiny stub now, replaced next task)

**Interfaces:**
- Produces: `pnpm run build:kernel` → `dist/kernel.js`.

**Why before the kernel file:** Landing build config with a stub proves the mode wiring end-to-end and keeps each commit green. Task 5 then fills the stub.

- [ ] **Step 1: Create a stub kernel entry**

Create `src/kernel/index.ts`:

```ts
// Copyright (C) 2023 Zuoqiu Yingyi
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import type * as kernel from "siyuan/kernel";

void siyuan;
void kernel;
```

- [ ] **Step 2: Add the `kernel` case to `vite.config.ts`**

In `vite.config.ts`, in the `build(mode)` function's `switch (mode)`, add a `kernel` case before the `default`:

```ts
        case "kernel":
            build.lib = {
                entry: resolve(import.meta.dirname, "src/kernel/index.ts"),
                fileName: "kernel",
                formats: ["es"],
            };
            build.emptyOutDir = false;
            break;
```

And in `rollupOptions.output.entryFileNames`, add a `kernel` case so the file lands at `kernel.js` (not `assets/kernel-[hash].js`):

```ts
                switch (chunkInfo.name) {
                    case "index":
                        return "[name].js";
                    case "wakatime":
                        return "workers/[name].js";
                    case "kernel":
                        return "[name].js";
                    default:
                        return "assets/[name]-[hash].js";
                }
```

- [ ] **Step 3: Add the `build:kernel` script in `package.json`**

In `package.json` `scripts`, add `build:kernel` and wire it into `build` and `build:dev`:

```json
        "build": "npm run build:plugin && npm run build:workers && npm run build:kernel",
        "build:dev": "vite build --mode plugin --sourcemap inline && vite build --mode workers --sourcemap inline && vite build --mode kernel --sourcemap inline",
        "build:kernel": "vite build --mode kernel",
```

(Replace the existing `build` and `build:dev` lines; keep `build:plugin`/`build:workers` lines unchanged.)

- [ ] **Step 4: Verify the kernel build produces `dist/kernel.js`**

Run: `pnpm -C workspace --filter wakatime run build:kernel`
Expected: PASS; `dist/kernel.js` exists. Verify with `ls -la dist/kernel.js`.

- [ ] **Step 5: Lint**

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd workspace/plugins/wakatime
git add vite.config.ts package.json src/kernel/index.ts
git commit -m "build(wakatime): add kernel build mode producing dist/kernel.js

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Implement `KernelWakaTime` — cache, timers, RPC methods

**Files:**
- Create (replace stub): `workspace/plugins/wakatime/src/kernel/index.ts`

**Interfaces:**
- Consumes: `IStorageBackend` + `WakaTimeCache` (Task 1), `CONSTANTS.KERNEL_CACHE_PATH` (Task 3), `IConfig`/`Context`/`Heartbeats`/`TCacheDatum`/`Category`/`Type` types (existing), `sleep` from `@workspace/utils/misc/sleep`, `JSONL` from `@/utils/jsonl`, `kernel` types from `siyuan/kernel`.
- Produces: `dist/kernel.js` that, on load, binds 6 RPC methods (`onload/unload/restart/updateConfig/addViewEvent/addEditEvent`) and starts timers. `addViewEvent` and `addEditEvent` both take a single `id: BlockID` and resolve block info internally.

This is the largest task. Build it in one file, in the order below. The structure mirrors `src/workers/wakatime.ts` exactly — same helper functions, same data shapes — only the I/O layer changes.

- [ ] **Step 1: Write the file header, imports, and the `siyuanStorageBackend`**

Replace `src/kernel/index.ts` entirely:

```ts
// Copyright (C) 2023 Zuoqiu Yingyi
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/* eslint-disable no-restricted-globals */
/* eslint-disable ts/no-use-before-define */
/* eslint-disable jsdoc/check-param-names */

import type * as kernel from "siyuan/kernel";

import { sleep } from "@workspace/utils/misc/sleep";

import { DEFAULT_CONFIG } from "@/configs/default";
import CONSTANTS from "@/constants";
import { WakaTimeCache } from "@/wakatime/cache";
import { Type } from "@/wakatime/heartbeats";
import JSONL from "@/utils/jsonl";

import type { BlockID } from "@workspace/types/siyuan";
import type { IConfig } from "@/types/config";
import type { Context, Heartbeats } from "@/types/wakatime";
import type { TCacheDatum } from "@/wakatime/cache";
import type { IStorageBackend } from "@/wakatime/cache";

type INotebook = {
    id: string;
    name: string;
};

/**
 * 内核版 WakaTime 插件。
 * 运行在 goja 内核运行时中, 通过 siyuan.rpc 暴露方法给前端。
 * Kernel-side WakaTime plugin. Runs in the goja runtime; exposes RPC methods
 * to the frontend via siyuan.rpc.
 */
class KernelWakaTime {
    private readonly siyuan: kernel.ISiyuan = siyuan;

    private readonly config: IConfig = DEFAULT_CONFIG;

    private readonly notebook = new Map<BlockID, INotebook>(); // 笔记本 ID => 笔记本信息

    private readonly cache: WakaTimeCache<TCacheDatum>;

    private readonly caches: InstanceType<typeof WakaTimeCache<TCacheDatum>>[] = [];

    private readonly timer = {
        heartbeat: 0, // 心跳定时器
        cacheCheck: 0, // 缓存检查定时器
    };

    private readonly context: Context.IContext = {
        url: "",
        method: "POST",
        headers: {
            "Authorization": "",
            "User-Agent": "",
            "X-Machine-Name": "",
        },

        project: "",
        language: "",

        includeID: [],
        excludeID: [],
        include: [],
        exclude: [],

        blocks: new Map<BlockID, BlockID>(),
        roots: new Map<BlockID, Context.IRoot>(),
        actions: new Array<Heartbeats.IAction>(),
    };

    constructor() {
        this.cache = new WakaTimeCache(
            this.siyuanStorageBackend,
            CONSTANTS.KERNEL_CACHE_PATH,
        );
    }

    /**
     * 基于 siyuan.storage 的缓存后端适配器。
     * siyuan.storage 路径相对于 data/storage/petal/<plugin-name>/。
     * Storage backend backed by siyuan.storage. Paths are relative to
     * data/storage/petal/<plugin-name>/.
     */
    private readonly siyuanStorageBackend: IStorageBackend = {
        putFile: (path, content) => this.siyuan.storage.put(path, content),
        getFile: async (path) => {
            const obj = await this.siyuan.storage.get(path);
            return obj.text();
        },
        readDir: async (path) => {
            const entries = await this.siyuan.storage.list(path);
            return entries.map((e) => ({ name: e.name, isDir: e.isDir }));
        },
        removeFile: (path) => this.siyuan.storage.remove(path),
    };
}

new KernelWakaTime();
```

Notes for the implementer:
- `INotebook` is declared locally (only `id` + `name` are used by the worker; keep the local type minimal — the SDK's full `INotebook` is unavailable in the kernel).
- `siyuan` is the global declared in `kernel.d.ts`; `this.siyuan = siyuan` mirrors `plugin-sample`.

- [ ] **Step 2: Add `kernelFetch` and `forwardProxy` helpers as private methods**

Inside the `KernelWakaTime` class body (after `siyuanStorageBackend`), add:

```ts
    /**
     * 调用内核 REST API 并校验 code。
     * Calls a kernel REST endpoint and verifies code === 0.
     */
    private async kernelFetch<T>(path: string, body?: Record<string, unknown>): Promise<T> {
        const resp = await this.siyuan.client.fetch(path, {
            method: "POST",
            body: body === undefined ? "{}" : JSON.stringify(body),
        });
        const data = await resp.json() as { code: number; msg: string; data: T };
        if (data.code !== 0) {
            throw new Error(`kernel ${path}: ${data.msg}`);
        }
        return data.data;
    }

    /**
     * 通过 /api/network/forwardProxy 外发 HTTP 请求。
     * Forwards an outbound HTTP request via /api/network/forwardProxy.
     */
    private async forwardProxy(request: Heartbeats.IRequest): Promise<{ status: number; body: string }> {
        const resp = await this.siyuan.client.fetch("/api/network/forwardProxy", {
            method: "POST",
            body: JSON.stringify({
                url: request.url,
                method: request.method,
                headers: [request.headers],
                timeout: request.timeout,
                payload: request.payload,
                contentType: "application/json",
                payloadEncoding: "json",
                responseEncoding: "text",
            }),
        });
        const data = await resp.json() as {
            code: number;
            msg: string;
            data: { status: number; body: string };
        };
        if (data.code !== 0) {
            throw new Error(`forwardProxy: ${data.msg}`);
        }
        return data.data;
    }
```

**Critical goja caveat:** `IDataObject.json()` is single-use (per `kernel.d.ts`). Each `kernelFetch`/`forwardProxy` call decodes exactly once — fine, since each builds a fresh response. Never call `.json()` twice on the same `resp`.

- [ ] **Step 3: Add the timer/context helpers (port from worker)**

As private methods, add these (direct ports from `src/workers/wakatime.ts`, with `self.` removed and `this.`/module references adjusted):

```ts
    /* 更新定时器 */
    private updateTimer(interval: number = this.config.wakatime.interval): void {
        /* 心跳定时器 */
        clearInterval(this.timer.heartbeat);
        this.timer.heartbeat = setInterval(() => void this.commit(), interval * 1_000);

        /* 缓存检查定时器 */
        clearInterval(this.timer.cacheCheck);
        this.timer.cacheCheck = setInterval(() => void this.checkCache(), CONSTANTS.CACHE_CHECK_INTERVAL);
    }

    /* 更新 wakatime 请求上下文 */
    private updateContext(): void {
        this.context.includeID = this.washList(this.config.wakatime.includeID);
        this.context.excludeID = this.washList(this.config.wakatime.excludeID);

        this.context.include = this.washList(this.config.wakatime.include);
        this.context.exclude = this.washList(this.config.wakatime.exclude);
    }

    /* 更新 notebook */
    private async updateNotebook(): Promise<INotebook[]> {
        const notebooks = await this.kernelFetch<{ notebooks: INotebook[] }>("/api/notebook/lsNotebooks");
        notebooks.notebooks.forEach((n) => this.notebook.set(n.id, n));
        return notebooks.notebooks;
    }

    /* 获取时间戳 */
    private time(date: Date = new Date()): number {
        return date.getTime() / 1_000;
    }

    /* 获取当前时间戳 */
    private now(): number {
        return this.time();
    }
```

Note: `setInterval(cb, ms)` in goja returns a number handle (like node), and `clearInterval(handle)` accepts it. The worker used `self.setInterval` returning a number into `timer.heartbeat`; same here. The `void this.commit()` wrapper discards the returned Promise (timers don't await).

- [ ] **Step 4: Port `commit`, `checkCache`, `sendHeartbeats`, `buildHeartbeat(s)`, `buildHeartbeatsRequest`, `filter`, `washList`, `addEvent`**

These are near-verbatim ports from `src/workers/wakatime.ts` lines 129–499. Convert each from a module-level `function` to a `private` method on the class, and apply these substitutions at every occurrence:

- `client.lsNotebooks()` → `this.updateNotebook()` (already wrapped) — actually `updateNotebook` is only called from `onload`; inside `commit`/`checkCache` there's no `lsNotebooks` call. Confirm by re-reading the worker.
- `client.getBlockInfo({ id })` → `this.kernelFetch<{ box: string; path: string; rootID: string }>("/api/block/getBlockInfo", { id })`
- `client.getHPathByPath({ path, notebook })` → `this.kernelFetch<string>("/api/filetree/getHPathByPath", { path, notebook })`
- `client.forwardProxy(request)` → `this.forwardProxy(request)` (returns `{status, body}`; the worker checked `response.data.status`, the new helper returns `.status` directly)
- `config` → `this.config`
- `context` → `this.context`
- `notebook` → `this.notebook`
- `cache` → `this.cache`
- `caches` → `this.caches`
- `timer` → `this.timer`
- `client.pushErrMsg({ msg })` → `await this.siyuan.logger.warn(msg)` (goja has no `pushErrMsg`; logger is the equivalent)
- `logger.debug(...)` / `logger.warn(...)` → `await this.siyuan.logger.debug(...)` / `await this.siyuan.logger.warn(...)`

Port `sendHeartbeats` (worker lines 340–358) — note the return-type change:

```ts
    /**
     * 发送心跳连接
     * REF: https://wakatime.com/developers#heartbeats
     */
    private async sendHeartbeats(
        request: Heartbeats.IRequest,
        reject: (request: Heartbeats.IRequest) => void,
    ): Promise<{ status: number; body: string } | null> {
        try {
            const response = await this.forwardProxy(request);
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            else {
                reject(request);
            }
        }
        catch (error) {
            void error;
            reject(request);
        }
        return null;
    }
```

Port `commit` (worker lines 128–190) verbatim except for the substitutions above. Port `checkCache` (lines 193–258), `buildHeartbeat` (lines 266–297), `buildHeartbeats` (lines 304–312), `buildHeartbeatsRequest` (lines 319–332), `filter` (lines 367–410), `washList` (lines 439–469), `addEvent` (lines 472–499). For each, re-read the worker source and apply only the substitutions listed. Do not alter control flow.

- [ ] **Step 5: Add the lifecycle hooks (`onload`, `onunload`) and wire them in the constructor**

Add the lifecycle methods and bind them in the constructor:

```ts
    constructor() {
        this.cache = new WakaTimeCache(
            this.siyuanStorageBackend,
            CONSTANTS.KERNEL_CACHE_PATH,
        );

        // 绑定生命周期钩子。
        // Wire lifecycle hooks.
        this.siyuan.plugin.lifecycle.onload = this.onload.bind(this);
        this.siyuan.plugin.lifecycle.onunload = this.onunload.bind(this);
    }
```

```ts
    /* 加载 */
    private async onload(): Promise<void> {
        /* 创建缓存目录 */
        await this.createCacheDirectory();

        /* 加载缓存数据 */
        await this.cache.load();

        /* 更新笔记本列表 */
        await this.updateNotebook();

        /* 绑定 RPC 方法 */
        await this.siyuan.rpc.bind("onload", this.rpcOnload.bind(this), "Initialize the wakatime kernel plugin.");
        await this.siyuan.rpc.bind("unload", this.rpcUnload.bind(this), "Stop the wakatime kernel plugin.");
        await this.siyuan.rpc.bind("restart", this.rpcRestart.bind(this), "Restart timers and context.");
        await this.siyuan.rpc.bind("updateConfig", this.rpcUpdateConfig.bind(this), "Update config and request context.");
        await this.siyuan.rpc.bind("addViewEvent", this.rpcAddViewEvent.bind(this), "Record a view heartbeat (id only).");
        await this.siyuan.rpc.bind("addEditEvent", this.rpcAddEditEvent.bind(this), "Record an edit heartbeat (id only).");
    }

    /* 卸载 */
    private async onunload(): Promise<void> {
        clearInterval(this.timer.heartbeat);
        clearInterval(this.timer.cacheCheck);
        await this.commit();

        await this.siyuan.rpc.unbind("onload");
        await this.siyuan.rpc.unbind("unload");
        await this.siyuan.rpc.unbind("restart");
        await this.siyuan.rpc.unbind("updateConfig");
        await this.siyuan.rpc.unbind("addViewEvent");
        await this.siyuan.rpc.unbind("addEditEvent");
    }
```

Add `createCacheDirectory` (port of worker lines 93–98, using `siyuan.storage`):

```ts
    /* 创建缓存目录 */
    private async createCacheDirectory(directory: string = CONSTANTS.KERNEL_CACHE_PATH): Promise<void> {
        /* storage.put 会自动创建父目录, 写一个占位文件确保目录存在 */
        await this.siyuan.storage.put(`${directory}/.gitkeep`, "");
    }
```

**Why a `.gitkeep` placeholder:** `siyuan.storage` has no "mkdir" — `put` creates parent dirs as needed (it writes a file). A no-op file guarantees the directory exists so `storage.list` doesn't reject on first run.

- [ ] **Step 6: Add the 6 RPC methods (`rpcOnload` etc.)**

These are the functions actually invoked by the frontend. They wrap the internal logic. Names match the worker's exported handlers so the frontend's `this.kernel.rpc.call.<name>(...)` maps 1:1.

```ts
    /* RPC: onload — 由前端在内核进入 running 状态后调用 */
    private async rpcOnload(): Promise<void> {
        /* 缓存目录与数据已在内核 onload 生命周期创建/加载, 此处补一次 notebook 刷新 */
        await this.updateNotebook();
    }

    /* RPC: unload */
    private async rpcUnload(): Promise<void> {
        clearInterval(this.timer.heartbeat);
        clearInterval(this.timer.cacheCheck);
        await this.commit();
    }

    /* RPC: restart */
    private rpcRestart(): void {
        this.updateTimer();
        this.updateContext();
    }

    /* RPC: updateConfig */
    private rpcUpdateConfig(
        config: IConfig,
        context: Pick<Context.IContext, "headers" | "language" | "project" | "url">,
    ): void {
        Object.assign(this.config, config);
        Object.assign(this.context, context);
    }

    /* RPC: addViewEvent — 与 addEditEvent 统一, 只传 id, 内核内部解析块信息 */
    private async rpcAddViewEvent(id: BlockID): Promise<void> {
        try {
            const time = this.now();

            /* 复用 addEditEvent 已建立的块映射, 若缺失则补查 getBlockInfo */
            let root_id = this.context.blocks.get(id);
            let root_info = root_id && this.context.roots.get(root_id);
            if (!root_info) {
                const block_info = await this.kernelFetch<{ box: string; path: string; rootID: string }>(
                    "/api/block/getBlockInfo",
                    { id },
                );
                root_id = block_info.rootID;
                root_info = {
                    id: root_id,
                    box: block_info.box,
                    path: block_info.path,
                    events: [],
                };

                this.context.blocks.set(id, root_id);
                this.context.roots.set(root_id, root_info);
            }

            this.addEvent({
                id: root_info.id,
                box: root_info.box,
                path: root_info.path,
                time,
                is_write: false,
            });
        }
        catch {
            /* 块删除事件导致无法查询到对应的块 — 静默忽略 */
        }
    }

    /* RPC: addEditEvent */
    private async rpcAddEditEvent(id: BlockID): Promise<void> {
        try {
            const time = this.now();

            /* 获取块对应的文档信息 */
            let root_id = this.context.blocks.get(id);
            let root_info = root_id && this.context.roots.get(root_id);
            if (!root_info) {
                const block_info = await this.kernelFetch<{ box: string; path: string; rootID: string }>(
                    "/api/block/getBlockInfo",
                    { id },
                );
                root_id = block_info.rootID;
                root_info = {
                    id: root_id,
                    box: block_info.box,
                    path: block_info.path,
                    events: [],
                };

                this.context.blocks.set(id, root_id);
                this.context.roots.set(root_id, root_info);
            }

            /* 添加编辑事件 */
            this.addEvent({
                id: root_info.id,
                box: root_info.box,
                path: root_info.path,
                time,
                is_write: true,
            });
        }
        catch {
            /* 块删除事件导致无法查询到对应的块 — 静默忽略 */
            /* Block deleted — silently ignore (mirrors worker's KernelError swallow). */
        }
    }
```

**Note on `rpcUnload` vs `onunload`:** `onunload` (kernel lifecycle) does the full teardown including RPC unbind. `rpcUnload` is the frontend-initiated stop (clears timers + final commit) — mirrors the worker's exported `unload()`. The kernel's own `onunload` also calls `commit`, so calling `rpcUnload` first then kernel-shutdown is safe (commit on empty context is a no-op).

- [ ] **Step 7: Verify the kernel build**

Run: `pnpm -C workspace --filter wakatime run build:kernel`
Expected: PASS; `dist/kernel.js` produced. If it fails, the most likely cause is a missed `this.` substitution from Step 4 — re-grep the worker source for any `client.`/`config.`/`context.` reference not converted.

- [ ] **Step 8: Lint**

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS (0 warnings). Common fix: unused imports (`trimSuffix` is not needed in the kernel — drop it).

- [ ] **Step 9: Commit**

```bash
cd workspace/plugins/wakatime
git add src/kernel/index.ts
git commit -m "feat(wakatime): implement kernel plugin with rpc/storage/forwardProxy

Ports worker heartbeat/cache/filter logic to the goja runtime. Binds 6 RPC
methods the frontend will call via this.kernel.rpc.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Switch frontend `src/index.ts` to `this.kernel.rpc`

**Files:**
- Modify: `workspace/plugins/wakatime/src/index.ts`

**Interfaces:**
- Consumes: the 6 RPC methods bound in Task 5 (`onload/unload/restart/updateConfig/addViewEvent/addEditEvent`).
- Produces: a frontend that drives the kernel plugin instead of the worker.

- [ ] **Step 1: Drop the worker/bridge imports and fields**

In `src/index.ts`:

- Remove `import { WorkerBridgeMaster } from "@workspace/utils/worker/bridge/master";`
- Remove `import { sleep } from "@workspace/utils/misc/sleep";` (only used by the worker-ready polling loop, which is being deleted — confirm no other use first; `grep -n sleep src/index.ts`).
- Remove `import type { THandlers } from "./workers/wakatime";`
- Remove `import manifest from "~/public/plugin.json";` ONLY IF `manifest` is now unused — `grep -n "manifest" src/index.ts`; `manifest.version` is used in `wakatimeDefaultUserAgent` and `initWorker`. Since `initWorker` is being deleted, `manifest` is still used by the user-agent getter. **Keep the import.**
- Remove the class fields `worker`, `bridge` (and the two timer fields if present — they aren't in `src/index.ts`, they're in the worker; verify with `grep -n "heartbeatTimer\|cacheCheckTimer" src/index.ts`).

- [ ] **Step 2: Delete the worker-bridge methods**

Delete these methods entirely from the class:
- `initBridge()`
- `initWorker()`
- `isWorkerRunning()`
- `updateWorkerConfig()` — **keep but rewrite** (next step).

- [ ] **Step 3: Rewrite `onload`, `updateWorkerConfig`, `onunload`, and the three event listeners**

Replace the body of `onload` (the `.finally(async () => { ... })` block). Keep icon registration and config loading; replace the worker-init block with a kernel-state listener:

```ts
            .finally(async () => {
                /* 监听内核插件状态变化, 进入 running 后初始化 */
                this.eventBus.on("kernel-plugin-state-change", this.onKernelPluginStateChange);

                /* 总线 */
                this.eventBus.on("ws-main", this.webSocketMainEventListener);

                /* 编辑器加载 */
                this.eventBus.on("loaded-protyle-static", this.protyleEventListener);
                this.eventBus.on("loaded-protyle-dynamic", this.protyleEventListener);
                this.eventBus.on("switch-protyle", this.protyleEventListener);
                this.eventBus.on("destroy-protyle", this.protyleEventListener);

                /* 编辑区点击 */
                this.eventBus.on("click-editorcontent", this.clickEditorContentEventListener);
            });
```

Add the state-change listener (new method):

```ts
    /* 内核插件状态变化监听器 */
    protected kernelPluginReady = false;
    protected async onKernelPluginStateChange(e: { detail: { code: number; description: string } }): Promise<void> {
        if (e.detail.code === 2 && !this.kernelPluginReady) { // running
            this.kernelPluginReady = true;
            await this.kernel.rpc.call.onload();
            await this.updateWorkerConfig();
        }
    }
```

Rewrite `updateWorkerConfig`:

```ts
    /* 更新内核插件配置 */
    public async updateWorkerConfig(): Promise<void> {
        await this.kernel.rpc.call.updateConfig(
            this.config,
            {
                url: this.wakatimeHeartbeatsApiUrl,
                headers: this.wakatimeHeaders,
                project: this.wakatimeProject,
                language: this.wakatimeLanguage,
            },
        );
        await this.kernel.rpc.call.restart();
    }
```

Rewrite `onunload`:

```ts
    public override onunload(): void {
        this.eventBus.off("kernel-plugin-state-change", this.onKernelPluginStateChange);
        this.eventBus.off("ws-main", this.webSocketMainEventListener);
        this.eventBus.off("loaded-protyle-static", this.protyleEventListener);
        this.eventBus.off("loaded-protyle-dynamic", this.protyleEventListener);
        this.eventBus.off("switch-protyle", this.protyleEventListener);
        this.eventBus.off("destroy-protyle", this.protyleEventListener);
        this.eventBus.off("click-editorcontent", this.clickEditorContentEventListener);

        void this.kernel.rpc.call.unload();
    }
```

Rewrite the three event listeners — replace each `this.bridge?.call<THandlers["xxx"]>("xxx", arg)` with `this.kernel.rpc.call.xxx(arg)` (fire-and-forget, no `await`, no `THandlers` type param). `addViewEvent` and `addEditEvent` both take only the block id:

In `webSocketMainEventListener`, the edit-event call:
```ts
                            if (operation.id) {
                                void this.kernel.rpc.call.addEditEvent(operation.id);
                            }
```

In `protyleEventListener` and `clickEditorContentEventListener` — only the rootID is sent; the kernel resolves `box`/`path`:
```ts
        if (protyle.notebookId && protyle.path && protyle.block.rootID) {
            void this.kernel.rpc.call.addViewEvent(protyle.block.rootID);
        }
```

- [ ] **Step 4: Verify the frontend builds and lints**

Run: `pnpm -C workspace --filter wakatime run build:plugin`
Expected: PASS; `dist/index.js` produced.

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS (0 warnings).

Run: `pnpm -C workspace --filter wakatime run check:svelte`
Expected: PASS (svelte files untouched; should be no regression).

- [ ] **Step 5: Commit**

```bash
cd workspace/plugins/wakatime
git add src/index.ts
git commit -m "refactor(wakatime): drive kernel plugin via this.kernel.rpc

Replaces WorkerBridgeMaster + BroadcastChannel with kernel RPC calls.
onload waits for kernel-plugin-state-change (running) before init.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Full build + docs sync

**Files:**
- Verify only (no source edits unless a regression appears)
- Modify: `docs/agents/project.md` if it documents the wakatime build commands (check first)

**Interfaces:** none.

- [ ] **Step 1: Run the full wakatime build**

Run: `pnpm -C workspace --filter wakatime run build`
Expected: PASS; `dist/` contains `index.js`, `workers/wakatime.js`, `kernel.js`.

- [ ] **Step 2: Run lint on the whole package**

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS (0 warnings).

- [ ] **Step 3: Check whether docs need updating**

Run: `grep -rn "build:workers\|build:kernel\|wakatime" docs/ 2>/dev/null | head`
If `docs/agents/project.md` (or any doc) lists wakatime build commands, add `build:kernel` to that list. Otherwise skip.

- [ ] **Step 4: Commit (only if docs changed)**

```bash
git add docs/...
git commit -m "docs: note wakatime kernel build step

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] **Step 5: Final summary**

Report:
- Files created/modified.
- Build + lint results (exact output tails).
- Open TODO: runtime smoke-test in a real SiYuan (repo has no test suite; lint/build are the available gates).

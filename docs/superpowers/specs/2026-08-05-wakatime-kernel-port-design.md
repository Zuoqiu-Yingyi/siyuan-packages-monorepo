# WakaTime 内核脚本移植设计

> 将 `workspace/plugins/wakatime/src/workers/wakatime.ts` 的全部业务逻辑移植到
> `workspace/plugins/wakatime/src/kernel/index.ts`，使其运行在 SiYuan 内核 goja 运行时中。

## 背景与动机

wakatime 插件当前把后台逻辑放在一个 Web Worker（`src/workers/wakatime.ts`）里，前端
`src/index.ts` 通过 `WorkerBridgeMaster` + `BroadcastChannel` 与之通讯。SiYuan 新增了内核
插件机制（`petal/kernel.d.ts` 声明的 `siyuan` 全局），插件可以在内核进程内运行 goja JS，
通过 `siyuan.rpc` JSON-RPC 暴露方法给前端 `this.kernel.rpc.call.<method>(...)` 调用。

将 worker 移植到内核脚本的好处：

- 不再依赖浏览器 Worker / BroadcastChannel，内核进程直接持有定时器与状态。
- 复用内核 `storage` / `logger` / `client.fetch`，去掉 `@siyuan-community/siyuan-sdk` 依赖。
- 与官方 `plugin-sample` 的 `src/kernel.ts` 参考实现对齐。

## 范围

本次改动覆盖：

1. 新建 `src/kernel/index.ts` —— worker 全部逻辑的内核版。
2. 改写 `src/wakatime/cache.ts` —— 抽出 `IStorageBackend` 接口，使 worker 与内核复用。
3. 改写前端 `src/index.ts` —— 删除 `WorkerBridgeMaster`/`initWorker`/`initBridge`/`isWorkerRunning`/`updateWorkerConfig`，改用 `this.kernel.rpc.call.<method>(...)`；`onload` 等 `kernel-plugin-state-change` 到 `running` 再驱动内核脚本。
4. `vite.config.ts` / `package.json` —— 增加 `build:kernel` 构建模式，输出 `dist/kernel.js`。

不在范围内：`testService`（继续放前端，沿用 SDK `forwardProxy`）。worker 文件 `src/workers/wakatime.ts` 仅做最小改动——cache 构造调用换成新适配器签名，其余逻辑不动；保留 worker 与 `build:workers` 避免破坏既有发布与回退路径（后续可清理）。

## 运行环境对照表

| worker 中使用                                                                                                                      | 内核中替换为                                                              | 备注                                        |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| `@siyuan-community/siyuan-sdk` `Client`（lsNotebooks/getBlockInfo/getHPathByPath/forwardProxy/putFile/getFile/readDir/removeFile） | `siyuan.client.fetch("/api/...", {method:"POST", body})` 直接打内核 REST  | goja 无 SDK，所有内核 API 手写 JSON         |
| `forwardProxy()` 外发 wakatime.com                                                                                                 | `siyuan.client.fetch("/api/network/forwardProxy", {method:"POST", body})` | 同一端点，响应取 `data.status`/`data.body`  |
| `WorkerBridgeSlave` + `BroadcastChannel`                                                                                           | `siyuan.rpc.bind(name, handler)`                                          | 前端改用 `this.kernel.rpc.call.<name>(...)` |
| `self.setInterval/clearInterval`                                                                                                   | `setInterval/clearInterval`                                               | goja 全局已提供                             |
| `@workspace/utils/logger` `Logger`                                                                                                 | `siyuan.logger`                                                           | 浏览器 `console.group` 在 goja 不适用       |
| `client.putFile/getFile/readDir/removeFile`（路径在 `data/...`）                                                                   | `siyuan.storage.put/get/list/remove`（相对 `data/storage/petal/<name>/`） | 缓存目录改为 `./.cache/`                    |
| `new Date()` / `Date.getTime()`                                                                                                    | 同（goja 支持）                                                           | `time()/now()` 语义不变                     |
| `self.location.pathname` 推断 baseURL                                                                                              | 不需要                                                                    | 内核脚本不在 HTTP 上下文                    |

## 架构

### 组件边界（`src/kernel/index.ts` 单文件，内部分三块）

1. **`KernelWakaTime` 类** —— 取代 worker 模块级全局状态。把 `config/context/notebook/cache/timer`
   收进实例字段。生命周期 `onload/onrunning/onunload` 绑到 `siyuan.plugin.lifecycle`。
2. **RPC 方法面** —— 名字与 worker 导出的 handler 完全一致：
   `onload/unload/restart/updateConfig/addViewEvent/addEditEvent`。在 `onload` 生命周期里
   `await siyuan.rpc.bind(name, handler)` 注册。参数签名与 worker 相同。
3. **内部辅助** —— `commit/checkCache/buildHeartbeat(s)/buildHeartbeatsRequest/sendHeartbeats/filter/washList/addEvent/time/now`
   作为私有方法或模块级函数，沿用 worker 实现。

### 数据流

```
前端 src/index.ts                          内核 src/kernel/index.ts
─────────────                              ─────────────────────
eventBus: ws-main/protyle/click             siyuan.event.handler (可选日志)
  → this.kernel.rpc.call.addEditEvent(id)      │
  → this.kernel.rpc.call.addViewEvent(info)     ▼
                                          RPC: addEditEvent/addViewEvent
                                              → 写入 context.roots/blocks
                                              │
                                  setInterval(commit, interval) ─► commit()
                                              │ 构造 IRequest[]
                                              ▼
                                  sendHeartbeats → siyuan.client.fetch(
                                    "/api/network/forwardProxy", {body: JSON})
                                              │
                                  失败 → storage.put(.cache/) ; 成功 → 丢弃
                                              │
                                  setInterval(checkCache) ─► storage.list(.cache/)
                                              → 重发缓存
```

### 前端↔内核 RPC 契约

内核侧（`siyuan.rpc.bind` 注册的方法）：

| 方法           | 参数                                                         | 返回            | 说明                                                   |
| -------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------ |
| `onload`       | 无                                                           | `Promise<void>` | 创建缓存目录、加载缓存、更新笔记本列表                 |
| `unload`       | 无                                                           | `Promise<void>` | 清定时器、最后一次 commit                              |
| `restart`      | 无                                                           | `void`          | `updateTimer()` + `updateContext()`                    |
| `updateConfig` | `(config: IConfig, context: {headers,language,project,url})` | `void`          | 合并到实例 config/context                              |
| `addViewEvent` | `(id: BlockID)`                                              | `Promise<void>` | 查块→记一条 view 心跳（与 addEditEvent 统一, 只传 id） |
| `addEditEvent` | `(id: BlockID)`                                              | `Promise<void>` | 查块→记一条 edit 心跳                                  |

前端侧调用点（对应替换 `bridge.call`）：

| 位置                              | 旧                                             | 新                                                                                             |
| --------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `onload`（state→running 后）      | `bridge.call("onload")` + `updateWorkerConfig` | `kernel.rpc.call.onload()` + `kernel.rpc.call.updateConfig(...)` + `kernel.rpc.call.restart()` |
| `webSocketMainEventListener`      | `bridge.call("addEditEvent", op.id)`           | `kernel.rpc.call.addEditEvent(op.id)`（fire-and-forget）                                       |
| `protyleEventListener`            | `bridge.call("addViewEvent", {id,box,path})`   | `kernel.rpc.call.addViewEvent(protyle.block.rootID)`（fire-and-forget，仅传 id）               |
| `clickEditorContentEventListener` | 同上                                           | 同上                                                                                           |
| `onunload`                        | `bridge.call("unload")` 后 terminate           | `kernel.rpc.call.unload()`                                                                     |

## 关键替换细节

### (a) 内核 REST 调用封装

定义私有 `kernelFetch(path, body?)`：

```ts
private async kernelFetch<T>(path: string, body?: any): Promise<T> {
    const resp = await this.siyuan.client.fetch(path, {
        method: "POST",
        body: body === undefined ? "{}" : JSON.stringify(body),
    });
    const data = await resp.json() as { code: number; msg: string; data: T };
    if (data.code !== 0) throw new Error(`kernel ${path}: ${data.msg}`);
    return data.data;
}
```

替代 SDK 方法：

- `client.lsNotebooks()` → `kernelFetch("/api/notebook/lsNotebooks")`，取 `notebooks`。
- `client.getBlockInfo({id})` → `kernelFetch("/api/block/getBlockInfo", {id})`，取 `rootID/box/path`。
- `client.getHPathByPath({path,notebook})` → `kernelFetch("/api/filetree/getHPathByPath", {path,notebook})`，取 HPath 字符串。

### (b) forwardProxy（外发 wakatime）

```ts
private async forwardProxy(req: Heartbeats.IRequest): Promise<{status:number; body:string}> {
    const resp = await this.siyuan.client.fetch("/api/network/forwardProxy", {
        method: "POST",
        body: JSON.stringify({
            url: req.url,
            method: req.method,
            headers: [req.headers],
            timeout: req.timeout,
            payload: req.payload,
            contentType: "application/json",
            payloadEncoding: "json",
            responseEncoding: "text",
        }),
    });
    const data = await resp.json() as { code:number; msg:string; data:{status:number; body:string} };
    if (data.code !== 0) throw new Error(`forwardProxy: ${data.msg}`);
    return data.data;
}
```

`sendHeartbeats` 沿用 worker：2xx 视为成功返回 response，否则 reject；catch 后 reject。

### (c) WakaTimeCache 改造（`src/wakatime/cache.ts`）

抽出 `IStorageBackend` 接口，`WakaTimeCache` 依赖它而非 `Client`：

```ts
export interface IStorageBackend {
    putFile(path: string, content: string): Promise<unknown>;
    getFile(path: string): Promise<string>;
    readDir(path: string): Promise<{ name: string; isDir: boolean }[]>;
    removeFile(path: string): Promise<unknown>;
}
```

- 构造器改为 `new WakaTimeCache(backend: IStorageBackend, directory, filename?)`。
- worker 侧注入一个基于 `Client` 的适配器（保持 worker 行为不变）。
- 内核侧注入一个基于 `siyuan.storage` 的适配器：

```ts
const storageBackend: IStorageBackend = {
    putFile: (p, c) => siyuan.storage.put(p, c),
    getFile: async (p) => (await (await siyuan.storage.get(p)).text()),
    readDir: async (p) => (await siyuan.storage.list(p)).map(e => ({name: e.name, isDir: e.isDir})),
    removeFile: (p) => siyuan.storage.remove(p),
};
```

- 缓存目录常量 `CONSTANTS.OFFLINE_CACHE_PATH` 保持值 `temp/.wakatime/cache` 不变（worker 端继续用）。
- 内核侧用新常量 `CONSTANTS.KERNEL_CACHE_PATH = ".cache"`（相对 storage 根）。
- 两端各自注入适配器：
  - worker 端（`src/workers/wakatime.ts` 构造 `WakaTimeCache` 处）：新增 `sdkStorageBackend` 适配器包住现有 `client`，`directory` 传 `CONSTANTS.OFFLINE_CACHE_PATH`。**仅改 cache.ts 与这一行构造调用，不改 worker 其余逻辑。**
  - 内核端：`siyuanStorageBackend` 适配 `siyuan.storage`，`directory` 传 `CONSTANTS.KERNEL_CACHE_PATH`。

### (d) 计时器与时间

goja 全局提供 `setInterval/clearInterval`；`new Date()` 可用。`updateTimer()`/`time()`/`now()`
逻辑不变，只是 `self.setInterval` → `setInterval`，`self.clearInterval` → `clearInterval`。

### (e) 错误处理

- `sendHeartbeats` 失败 → reject → 写缓存（沿用）。
- `checkCache` 重发首条失败即中止本轮（沿用）。
- `getBlockInfo` 失败（块已删）→ 静默忽略。内核无 `KernelError` 类型，改为在 `kernelFetch`
  抛错时由 `addEditEvent` 的 try/catch 吞掉（与原 `catch (error) { if (error instanceof KernelError) {} else throw }`
  等价——内核侧所有 fetch 失败都按"块不可用"静默处理，因为内核脚本里 fetch 失败的语义
  和 SDK 抛 KernelError 一致）。

### (f) `btoa` 与 headers

`Authorization: Basic btoa(api_key)` 仍由前端 `updateConfig` 时算好，随 `context.headers`
传入内核（与 worker 行为一致）。内核侧不碰 `btoa`。

## 前端 `src/index.ts` 改动清单

- 删除字段：`worker`, `bridge`, `heartbeatTimer`, `cacheCheckTimer`（后两者本来就没在前端用，仅 worker 用；前端保留无意义）。
- 删除方法：`initBridge`, `initWorker`, `isWorkerRunning`, `updateWorkerConfig`。
- `onload`：
  - 保留：加载图标、加载配置（`loadData`）、注册 eventBus 监听。
  - 新增：`this.eventBus.on("kernel-plugin-state-change", this.onKernelPluginStateChange)`。
  - `onKernelPluginStateChange(e)`：`detail.code === 2`（running）时执行
    `await this.kernel.rpc.call.onload()` → `await this.updateWorkerConfig()` → 等
    `kernel-plugin-state-change` 触发一次即可（幂等保护：已初始化则跳过）。
  - `updateWorkerConfig` 改为 `await this.kernel.rpc.call.updateConfig(this.config, {url,headers,project,language})` 后 `await this.kernel.rpc.call.restart()`。
- `webSocketMainEventListener` / `protyleEventListener` / `clickEditorContentEventListener`：
  `this.bridge?.call(...)` → `this.kernel.rpc.call.<method>(...)`（不 await，fire-and-forget）。
- `onunload`：`this.kernel.rpc.call.unload()`（await 后无需 terminate）。
- 删除 `import { WorkerBridgeMaster }`；删除 `THandlers` 类型导入。

## 构建配置

`vite.config.ts`：

- `build(env.mode)` 增加 `case "kernel":` 分支：
  - `build.lib = { entry: resolve(import.meta.dirname, "src/kernel/index.ts"), fileName: "kernel", formats: ["es"] }`
  - `build.emptyOutDir = false`
  - `rollupOptions.output.entryFileNames` 加 `case "kernel": return "kernel.js"`
  - `external` 已含 `"siyuan"`，覆盖。

`package.json`：

- `scripts.build:kernel`: `"vite build --mode kernel"`
- `scripts.build`: `"npm run build:plugin && npm run build:workers && npm run build:kernel"`（或 run-s）
- `scripts.build:dev` 同步加 kernel。

内核入口按约定 `dist/kernel.js`，`public/plugin.json` 无需新增字段（SiYuan 按固定路径加载内核脚本，与 plugin-sample 一致）。

## 验证

- `pnpm -C workspace --filter wakatime run build:kernel` 产出 `dist/kernel.js`。
- `pnpm -C workspace --filter wakatime run lint` 通过（含前端与内核文件）。
- `pnpm -C workspace --filter wakatime run check:svelte` 通过（前端 svelte 未动，应无回归）。
- `pnpm -C workspace --filter wakatime run build`（全量）通过。
- 仓库无统一测试套件（AGENTS.md 标 TODO），运行时联调留 TODO。

## 风险与遗留

- **worker 文件保留**：本期仅最小改动 worker 的 cache 构造调用以适配新 `IStorageBackend` 接口，保留 `build:workers`；内核脚本就绪后可在后续 PR 清理 worker 与 `build:workers`。
- **运行时验证缺失**：lint/build 通过不代表内核脚本在真机 goja 里行为正确；需在
  SiYuan 实际加载插件后观察日志（`siyuan.logger` 输出到内核日志）。
- **forwardProxy 响应字段**：`/api/network/forwardProxy` 返回 `data.body` 为 text；
  wakatime 心跳接口的响应体未在 worker 解析（只看 status），内核侧同样只看 status，安全。
- **storage 路径隔离**：缓存从 `data/temp/.wakatime/cache` 迁到
  `data/storage/petal/<name>/.cache`，旧缓存不会自动迁移；首次加载视为空缓存，可接受。

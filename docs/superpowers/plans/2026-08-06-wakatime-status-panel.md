# WakaTime Status Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the WakaTime status summary as charts in `Status.svelte`, opened via a dialog from the status-bar icon, reusing `plugin.siyuan.ProtyleMethod.chartRender` for echarts rendering.

**Architecture:** `Status.svelte` builds `[data-subtype="echarts"]` DOM nodes whose `data-content` is an HTML-escaped echarts option JSON derived from the live `Summary` data, then defers to `chartRender` for echarts loading/theming/init. Layout mirrors `Settings.svelte` (`<Panels>` → `<Panel>` → `<Tabs>`): an Overview panel of plain-text KPIs and a Breakdown panel with one tab per `Summary` dimension, each rendered by a reusable `DimensionChart.svelte`.

**Tech Stack:** Svelte 5 (runes), TypeScript, LESS, SiYuan plugin SDK, `@workspace/components` Panels/Tabs/Panel, the app's exposed `ProtyleMethod.chartRender` (echarts loaded from `/stage/protyle/js/echarts/`).

## Global Constraints

- **No test suite exists** (per AGENTS.md "TODO: no repository-wide test script is defined"). Verification gates are: `check:svelte` (type-check), `build:plugin`, `lint`. Where the writing-plans TDD rhythm calls for "write a failing test," this plan substitutes a **type-check-then-implement** rhythm using `check:svelte`, with the failing-state assertion being "the new symbol does not yet exist / does not type-check." No test files are created.
- **Package manager:** `pnpm@11.17.0`. Run plugin commands via `pnpm -C workspace --filter wakatime run <script>`.
- **i18n parity:** `src/utils/i18n.ts` enforces compile-time identical shape across `public/i18n/{en,zh-CN,zh-TW}.json`. All three locale files must be edited together for any i18n change.
- **`Status.Category` is a namespaced type**, not a top-level export — import as `import type { Status } from "@/types/wakatime"` and reference `Status.Category`. Do not collide with the heartbeat `Category` enum from `@/wakatime/heartbeats`.
- **No new npm dependencies.** Echarts is loaded by `chartRender` from the app stage path; do not `pnpm add echarts`.
- **License header:** Every new `.svelte` / `.ts` file under `src/` starts with the AGPL-3.0-or-later header block identical to `Status.svelte`'s lines 1-16.
- **Preserve dirty worktree:** Do not revert or overwrite unrelated local changes (per AGENTS.md).

---

## File Structure

| File | Responsibility | Status |
|---|---|---|
| `src/constants.ts` | Add `STATUS_PANEL_DIALOG_ID` name + dialog id constant | Modify |
| `public/i18n/en.json` | Add `status` i18n key (English) | Modify |
| `public/i18n/zh-CN.json` | Add `status` i18n key (Simplified Chinese) | Modify |
| `public/i18n/zh-TW.json` | Add `status` i18n key (Traditional Chinese) | Modify |
| `src/components/DimensionChart.svelte` | **New.** Reusable echarts wrapper: builds the `[data-subtype="echarts"]` DOM, computes a donut option from `Status.Category[]`, escapes to `data-content`, calls `chartRender`. One component for all 7 dimensions. | Create |
| `src/components/Status.svelte` | Root layout: `<Panels>` Overview + Breakdown, `<Tabs>` for 7 dimensions, scoped CSS to hide protyle-icons. | Modify |
| `src/index.ts` | Fill `openStatusPanel` stub to open a dialog and `mount(Status, …)`. | Modify |

Decomposition rationale: `DimensionChart` is isolated as its own file because (a) it's the only unit with chart logic, (b) it's reused 7× by `Status.svelte`, and (c) it can be type-checked/build-tested in isolation once `Status.svelte` imports it. i18n is its own task because the parity check is the gate and all three files change together.

---

### Task 1: Add `status` i18n keys

**Files:**
- Modify: `public/i18n/en.json`
- Modify: `public/i18n/zh-CN.json`
- Modify: `public/i18n/zh-TW.json`

**Interfaces:**
- Produces: `plugin.i18n.status.{title, panel.overview, panel.breakdown, cachedAt, noData, dimension.{languages,editors,projects,operating_systems,machines,categories,dependencies}}` — the shape all later UI tasks consume. `utils/i18n.ts` enforces parity, so a later task referencing `i18n.status.dimension.languages` will type-check only if all three files share this exact shape.

- [ ] **Step 1: Add the `status` key to `en.json`**

Insert a new top-level `"status"` key alongside `"settings"` and `"topBar"`. The `dimension` sub-object keys MUST exactly match the `Summary` field names (languages, editors, projects, operating_systems, machines, categories, dependencies) — later tasks use these as both i18n keys and `status.data` field names:

```json
"status": {
    "title": "WakaTime Status",
    "panel": {
        "overview": "Overview",
        "breakdown": "Breakdown"
    },
    "cachedAt": "Cached at",
    "noData": "No data available. Check your API KEY and connection in settings.",
    "dimension": {
        "languages": "Languages",
        "editors": "Editors",
        "projects": "Projects",
        "operating_systems": "Operating Systems",
        "machines": "Machines",
        "categories": "Categories",
        "dependencies": "Dependencies"
    }
}
```

- [ ] **Step 2: Add the parallel `status` key to `zh-CN.json`**

Same shape, Simplified Chinese values:

```json
"status": {
    "title": "WakaTime 状态",
    "panel": {
        "overview": "概览",
        "breakdown": "细分"
    },
    "cachedAt": "缓存于",
    "noData": "暂无数据。请在设置中检查 API KEY 与连接。",
    "dimension": {
        "languages": "编程语言",
        "editors": "编辑器",
        "projects": "项目",
        "operating_systems": "操作系统",
        "machines": "机器",
        "categories": "活动类别",
        "dependencies": "依赖"
    }
}
```

- [ ] **Step 3: Add the parallel `status` key to `zh-TW.json`**

Same shape, Traditional Chinese values:

```json
"status": {
    "title": "WakaTime 狀態",
    "panel": {
        "overview": "概覽",
        "breakdown": "細分"
    },
    "cachedAt": "快取於",
    "noData": "暫無資料。請在設定中檢查 API KEY 與連線。",
    "dimension": {
        "languages": "程式語言",
        "editors": "編輯器",
        "projects": "專案",
        "operating_systems": "作業系統",
        "machines": "機器",
        "categories": "活動類別",
        "dependencies": "依賴"
    }
}
```

- [ ] **Step 4: Type-check to verify i18n parity passes**

Run: `pnpm -C workspace --filter wakatime run check:svelte`
Expected: The i18n parity check (`src/utils/i18n.ts` runs at compile time via the `I18N` type derived from `zh_Hans`) passes for the new `status` key. The only acceptable pre-existing error is `'IObject' is declared but never used` in vendored `siyuan@1.2.3/types/constants.ts` — that is unrelated and must not increase. No new errors referencing `i18n.status` or a missing key.

- [ ] **Step 5: Commit**

```bash
git add public/i18n/en.json public/i18n/zh-CN.json public/i18n/zh-TW.json
git commit -m "feat(wakatime): add status panel i18n keys"
```

---

### Task 2: Add the status-panel dialog id constant

**Files:**
- Modify: `src/constants.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `CONSTANTS.STATUS_PANEL_DIALOG_ID` (a string constant) and `WakaTimePlugin.STATUS_PANEL_DIALOG_ID` (a `readonly string` instance field set in the constructor), consumed by Task 6's `openStatusPanel`. Keeps the status dialog id purpose-named and separate from `SETTINGS_DIALOG_ID`.

- [ ] **Step 1: Read `src/constants.ts` to locate the id-name insertion point**

Run: `grep -n "KERNEL_RPC_METHOD\|STATUS\|GLOBAL_CONFIG_NAME" src/constants.ts`
Expected: shows the `GLOBAL_CONFIG_NAME` constant and the `KERNEL_RPC_METHOD` block; the dialog-id naming convention will follow `GLOBAL_CONFIG_NAME`.

- [ ] **Step 2: Add the dialog id base name to `src/constants.ts`**

Add a `STATUS_PANEL_DIALOG_ID` field to the `CONSTANTS` object (mirroring the existing `GLOBAL_CONFIG_NAME` style). Place it adjacent to `GLOBAL_CONFIG_NAME`:

```ts
STATUS_PANEL_DIALOG_ID: "status-panel-dialog", // 状态面板对话框 ID
```

- [ ] **Step 3: Add the instance field and constructor assignment to `src/index.ts`**

Add a `protected readonly STATUS_PANEL_DIALOG_ID: string;` field declaration next to the existing `SETTINGS_DIALOG_ID` (around line 72), and set it in the constructor next to the `SETTINGS_DIALOG_ID` assignment (around line 85):

Declaration (next to `protected readonly SETTINGS_DIALOG_ID: string;`):
```ts
protected readonly STATUS_PANEL_DIALOG_ID: string; // 状态面板对话框 ID
```

Constructor (next to `this.SETTINGS_DIALOG_ID = `${this.name}-settings-dialog`;`):
```ts
this.STATUS_PANEL_DIALOG_ID = `${this.name}-${CONSTANTS.STATUS_PANEL_DIALOG_ID}`;
```

- [ ] **Step 4: Type-check**

Run: `pnpm -C workspace --filter wakatime run check:svelte`
Expected: PASS (only the unrelated pre-existing `IObject` error). `CONSTANTS.STATUS_PANEL_DIALOG_ID` and `this.STATUS_PANEL_DIALOG_ID` resolve.

- [ ] **Step 5: Commit**

```bash
git add src/constants.ts src/index.ts
git commit -m "feat(wakatime): add status panel dialog id constant"
```

---

### Task 3: Create `DimensionChart.svelte` (reusable chart wrapper)

**Files:**
- Create: `src/components/DimensionChart.svelte`

**Interfaces:**
- Consumes: `Status.Category[]` (from `@/types/wakatime`, nested in the `Status` namespace), `WakaTimePlugin` (from `@/index`), `plugin.siyuan.ProtyleMethod.chartRender(element: Element)`, global `Lute.EscapeHTMLStr(str: string): string` (declared in the app's `protyle.d.ts`).
- Produces: default-exported Svelte component with `TProps { categories: Status.Category[]; title: string; plugin: InstanceType<typeof WakaTimePlugin> }`, rendering either a `noData` placeholder or a chart container that `chartRender` fills. Consumed by Task 5 (`Status.svelte`) — it imports this component's default export and passes these three props.

- [ ] **Step 1: Create `DimensionChart.svelte` with the AGPL header + module script + component script**

Create `src/components/DimensionChart.svelte`. Start with the license header copied verbatim from `Status.svelte` lines 1-16, then a `<!-- 维度图表 -->` comment, then:

Module script (types only):
```svelte
<script lang="ts" module>
    import type { Status } from "@/types/wakatime";
    import type WakaTimePlugin from "@/index";

    export interface TProps {
        categories: Status.Category[]; // 一个维度的分项数据
        title: string; // 维度标题 (i18n)
        plugin: InstanceType<typeof WakaTimePlugin>; // 插件实例
    }

    export interface IHandlers {}

    export interface ISlots {}

    export type TProps = TProps & IHandlers & ISlots;
</script>
```

Component script:
```svelte
<script lang="ts">
    const {
        categories,
        title,
        plugin,
    }: TProps = $props();

    const i18n = plugin.i18n;

    // chartRender 的目标容器根节点
    let container = $state<HTMLDivElement>();

    /**
     * 由 Category[] 构建 echarts 环形图配置
     * value 取 total_seconds（规范时长度量），echarts 据此重新计算占比
     */
    function buildOption(cats: Status.Category[]): Record<string, unknown> {
        return {
            tooltip: {
                trigger: "item",
                formatter: "{b}: {c}s ({d}%)",
            },
            legend: {
                type: "scroll",
                orient: "vertical",
                right: 0,
                top: "middle",
            },
            series: [
                {
                    type: "pie",
                    radius: ["40%", "70%"],
                    avoidLabelOverlap: true,
                    label: {
                        show: true,
                        formatter: "{b} {d}%",
                    },
                    data: cats
                        .filter(c => c.total_seconds > 0)
                        .map(c => ({ name: c.name, value: c.total_seconds })),
                },
            ],
        };
    }

    // 当 categories 变化且非空时，构建 [data-subtype="echarts"] DOM 并调用 chartRender
    $effect(() => {
        if (!container || categories.length === 0) {
            return;
        }
        const option = buildOption(categories);
        const node = document.createElement("div");
        node.setAttribute("data-subtype", "echarts");
        node.setAttribute("data-content", Lute.EscapeHTMLStr(JSON.stringify(option)));
        node.innerHTML = "<div></div>";
        container.innerHTML = "";
        container.appendChild(node);
        plugin.siyuan.ProtyleMethod.chartRender(node);
    });
</script>
```

- [ ] **Step 2: Add the template + placeholder + scoped style**

After the second `</script>`, append:

```svelte
{#if categories.length === 0}
    <div class="dimension-chart__empty">{i18n.status.noData}</div>
{:else}
    <div class="dimension-chart__container" bind:this={container}></div>
{/if}

<style lang="less">
    .dimension-chart__container {
        height: 420px;
        width: 100%;
    }

    .dimension-chart__empty {
        padding: 1em;
        color: var(--b3-theme-on-surface);
        text-align: center;
    }
</style>
```

- [ ] **Step 3: Type-check (expect failure — unused component, no consumer yet)**

Run: `pnpm -C workspace --filter wakatime run check:svelte`
Expected: PASS for this file in isolation (Svelte compiles unreferenced components). The only acceptable pre-existing error is the unrelated `IObject` one. No new errors. If `Lute` is not in the ambient type scope, add a `// Lute is a global declared by the SiYuan app runtime` reference — but it is already ambiently available (the app's `protyle.d.ts` declares `class Lute`, and the plugin already uses `siyuanGlobal.Lute.NewNodeID()` in `index.ts:321`).

- [ ] **Step 4: Build to verify the component compiles into the plugin bundle**

Run: `pnpm -C workspace --filter wakatime run build:plugin`
Expected: PASS — the component is bundled (Vite tree-shakes unused Svelte modules only when truly unreferenced; an unreferenced `.svelte` with a module script may be dropped, so if the build emits no chunk for it that's acceptable too — the type-check in Step 3 is the real gate). No build errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/DimensionChart.svelte
git commit -m "feat(wakatime): add reusable DimensionChart component"
```

---

### Task 4: Add the `DimensionChart` type re-export to `props.svelte.ts` (optional convenience)

> **Skip this task** if you prefer to import `DimensionChart` directly via its default export in Task 5. It is included only to mirror how `Status.svelte`'s `TProps` is re-exported from `props.svelte.ts`. If skipping, leave `props.svelte.ts` unchanged and proceed to Task 5.

**Files:**
- Modify: `src/components/props.svelte.ts`

**Interfaces:**
- Produces: a type-only re-export of `TProps as TDimensionChartProps` for symmetry with the existing `TStatusProps` re-export. No runtime impact; consumed optionally by Task 5.

- [ ] **Step 1: Add the type re-export at the top of `props.svelte.ts`**

After the existing `import type { TProps as TStatusProps } from "./Status.svelte";` line, add:

```ts
export type { TProps as TDimensionChartProps } from "./DimensionChart.svelte";
```

- [ ] **Step 2: Type-check**

Run: `pnpm -C workspace --filter wakatime run check:svelte`
Expected: PASS (only the unrelated pre-existing `IObject` error).

- [ ] **Step 3: Commit**

```bash
git add src/components/props.svelte.ts
git commit -m "feat(wakatime): re-export DimensionChart props type"
```

---

### Task 5: Implement `Status.svelte` layout (Overview + Breakdown tabs)

**Files:**
- Modify: `src/components/Status.svelte`

**Interfaces:**
- Consumes: `Status.IResponse` (from `@/types/wakatime`), `WakaTimePlugin` (from `@/index`), workspace components `Panels`/`Panel`/`Tabs` + `ITab` type, `DimensionChart` (default export from `./DimensionChart.svelte`), `status` i18n key (Task 1). Props come from `statusProps` (`$state` in `props.svelte.ts`): `{ status?: Status.IResponse; plugin?: WakaTimePlugin }`.
- Produces: a rendered status panel dialog body. Consumed by Task 6 (`openStatusPanel` mounts this component).

- [ ] **Step 1: Add the component imports + state setup in `Status.svelte`**

Replace the empty `<script lang="ts">` body (lines 39-45) with imports and derived state. Keep the existing module `<script lang="ts" module>` block (lines 20-37) unchanged. The new component script:

```svelte
<script lang="ts">
    import Panels from "@workspace/components/siyuan/setting/panel/Panels.svelte";
    import Panel from "@workspace/components/siyuan/setting/panel/Panel.svelte";
    import Tabs from "@workspace/components/siyuan/setting/tab/Tabs.svelte";

    import DimensionChart from "./DimensionChart.svelte";

    import type { ITab } from "@workspace/components/siyuan/setting/tab";

    const {
        status,
        plugin,
    }: TProps = $props();

    const i18n = plugin.i18n;

    // svelte-ignore state_referenced_locally
    const data = $derived(status?.data);

    const PanelKey = {
        overview: "overview",
        breakdown: "breakdown",
    } as const;

    const panels_focus_key = PanelKey.overview;
    const panels: ITab[] = [
        {
            key: PanelKey.overview,
            text: i18n.status.panel.overview,
            name: i18n.status.panel.overview,
            icon: "#iconInfo",
        },
        {
            key: PanelKey.breakdown,
            text: i18n.status.panel.breakdown,
            name: i18n.status.panel.breakdown,
            icon: "#iconList",
        },
    ];

    const DimensionKey = {
        languages: "languages",
        editors: "editors",
        projects: "projects",
        operating_systems: "operating_systems",
        machines: "machines",
        categories: "categories",
        dependencies: "dependencies",
    } as const;

    const breakdown_focus_key = DimensionKey.languages;
    const breakdown_tabs: ITab[] = [
        { key: DimensionKey.languages, text: i18n.status.dimension.languages, name: i18n.status.dimension.languages, icon: "💻" },
        { key: DimensionKey.editors, text: i18n.status.dimension.editors, name: i18n.status.dimension.editors, icon: "✏️" },
        { key: DimensionKey.projects, text: i18n.status.dimension.projects, name: i18n.status.dimension.projects, icon: "📁" },
        { key: DimensionKey.operating_systems, text: i18n.status.dimension.operating_systems, name: i18n.status.dimension.operating_systems, icon: "🖥️" },
        { key: DimensionKey.machines, text: i18n.status.dimension.machines, name: i18n.status.dimension.machines, icon: "🔌" },
        { key: DimensionKey.categories, text: i18n.status.dimension.categories, name: i18n.status.dimension.categories, icon: "🏷️" },
        { key: DimensionKey.dependencies, text: i18n.status.dimension.dependencies, name: i18n.status.dimension.dependencies, icon: "📦" },
    ];
</script>
```

- [ ] **Step 2: Add the template — Overview panel + Breakdown panel with tabs**

Replace the empty `<style lang="less"></style>` region's preceding content (between the second `</script>` and `<style>`) with:

```svelte
<div class="status-panel fn__flex-column">
    <Panels
        focus={panels_focus_key}
        {panels}
        let:focus={focusPanel}
    >
        <!-- 概览面板 -->
        <Panel display={panels[0]?.key === focusPanel}>
            {#if data}
                <div class="status-overview">
                    <div class="status-overview__total">
                        <span class="status-overview__digital">{data.grand_total.digital}</span>
                        <span class="status-overview__text">{data.grand_total.text}</span>
                    </div>
                    <div class="status-overview__range">
                        <span>{data.range.text}</span>
                        <span class="status-overview__date">{data.range.date}</span>
                        <span class="status-overview__tz">{data.range.timezone}</span>
                    </div>
                    <div class="status-overview__cached">{i18n.status.cachedAt}: {status.cached_at}</div>
                </div>
            {:else}
                <div class="status-overview__empty">{i18n.status.noData}</div>
            {/if}
        </Panel>

        <!-- 细分面板 -->
        <Panel display={panels[1]?.key === focusPanel}>
            <Tabs
                focus={breakdown_focus_key}
                tabs={breakdown_tabs}
                let:focus={focusTab}
            >
                {#each breakdown_tabs as tab (tab.key)}
                    <div
                        class="fn__none={tab.key !== focusTab}
                        data-type={tab.name}
                    >
                        <DimensionChart
                            categories={data?.[tab.key as keyof typeof data] ?? []}
                            title={tab.text}
                            {plugin}
                        />
                    </div>
                {/each}
            </Tabs>
        </Panel>
    </Panels>
</div>
```

> Note: `data?.[tab.key as keyof typeof data]` indexes the `Summary` by the dimension key. All 7 `DimensionKey` values are real `Summary` fields of type `Category[]`, so the cast is sound. The `?? []` coerces the no-data case so `DimensionChart` shows its placeholder.

- [ ] **Step 3: Add the scoped style — hide inert protyle-icons + overview layout**

Replace the empty `<style lang="less"></style>` with:

```svelte
<style lang="less">
    .status-panel {
        height: 100%;
    }

    /* chartRender 注入的 protyle-icons (刷新/编辑/更多) 在对话框中无对应处理器，隐藏 */
    :global(.b3-dialog__content) .status-panel .protyle-icons {
        display: none;
    }

    .status-overview {
        padding: 1em;
        display: flex;
        flex-direction: column;
        gap: 0.75em;
    }

    .status-overview__total {
        display: flex;
        align-items: baseline;
        gap: 0.5em;
    }

    .status-overview__digital {
        font-size: 2em;
        font-weight: 600;
    }

    .status-overview__text {
        color: var(--b3-theme-on-surface);
    }

    .status-overview__range {
        display: flex;
        gap: 1em;
        color: var(--b3-theme-on-surface);
    }

    .status-overview__cached {
        color: var(--b3-theme-on-surface-light);
        font-size: 0.875em;
    }

    .status-overview__empty {
        padding: 1em;
        text-align: center;
        color: var(--b3-theme-on-surface);
    }
</style>
```

- [ ] **Step 4: Type-check**

Run: `pnpm -C workspace --filter wakatime run check:svelte`
Expected: PASS (only the unrelated pre-existing `IObject` error). `data?.[tab.key as keyof typeof data]` type-checks because every `DimensionKey` value is a `keyof Summary`. `DimensionChart` props match its `TProps`.

- [ ] **Step 5: Build to verify the full component compiles**

Run: `pnpm -C workspace --filter wakatime run build:plugin`
Expected: PASS — `Status.svelte` and `DimensionChart.svelte` both bundle.

- [ ] **Step 6: Lint**

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS with `--max-warnings 0` (zero warnings).

- [ ] **Step 7: Commit**

```bash
git add src/components/Status.svelte
git commit -m "feat(wakatime): implement status panel layout with charts"
```

---

### Task 6: Wire `openStatusPanel` to open the dialog

**Files:**
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Status` default export (from `./components/Status.svelte`), `statusProps` (from `./components/props.svelte.ts`), `this.STATUS_PANEL_DIALOG_ID` (Task 2), `siyuan.Dialog`, `mount` (already imported), `FLAG_MOBILE` (already imported), `this.i18n.status.title` (Task 1).
- Produces: a working `openStatusPanel` that opens a dialog and mounts `Status.svelte`, completing the feature.

- [ ] **Step 1: Add the `Status` import at the top of `src/index.ts`**

Next to the existing `import Settings from "./components/Settings.svelte";` (line 37), add:

```ts
import Status from "./components/Status.svelte";
```

- [ ] **Step 2: Fill the `openStatusPanel` stub**

Replace the empty stub at `src/index.ts` (the `protected readonly openStatusPanel = () => {\n\n    };` block, around lines 304-306) with:

```ts
    /* 打开状态面板 */
    protected readonly openStatusPanel = () => {
        const dialog = new siyuan.Dialog({
            title: `${this.i18n.status.title} <code class="fn__code">${this.name}</code>`,
            content: `<div id="${this.STATUS_PANEL_DIALOG_ID}" class="fn__flex-column" />`,
            width: FLAG_MOBILE ? "92vw" : "720px",
            height: FLAG_MOBILE ? undefined : "640px",
        });
        const target = dialog.element.querySelector(`#${this.STATUS_PANEL_DIALOG_ID}`);
        if (target) {
            mount(Status, {
                target,
                props: statusProps,
            });
        }
    };
```

- [ ] **Step 3: Type-check**

Run: `pnpm -C workspace --filter wakatime run check:svelte`
Expected: PASS (only the unrelated pre-existing `IObject` error). `Status` default export resolves, `statusProps` matches `Status.TProps` (`{ status?, plugin? }`), `this.STATUS_PANEL_DIALOG_ID` resolves (Task 2).

- [ ] **Step 4: Build the full plugin**

Run: `pnpm -C workspace --filter wakatime run build:plugin`
Expected: PASS — `Status.svelte`, `DimensionChart.svelte`, and the `openStatusPanel` wiring all compile into the plugin bundle.

- [ ] **Step 5: Lint**

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS with `--max-warnings 0`.

- [ ] **Step 6: Commit**

```bash
git add src/index.ts
git commit -m "feat(wakatime): open status panel dialog from status bar"
```

---

### Task 7: Full verification + AGENTS.md doc note

**Files:**
- Read-only: `docs/agents/testing.md` (to confirm whether a verification note is needed)

**Interfaces:**
- Consumes: all prior tasks. This is the gate before declaring done.

- [ ] **Step 1: Run the complete verification suite**

Run all three (the canonical verification commands for a code change per AGENTS.md):
```bash
pnpm -C workspace --filter wakatime run check:svelte
pnpm -C workspace --filter wakatime run build:plugin
pnpm -C workspace --filter wakatime run lint
```
Expected:
- `check:svelte`: COMPLETED with only the pre-existing `IObject` error in vendored `siyuan@1.2.3/types/constants.ts`. No new errors, no errors in `wakatime` source.
- `build:plugin`: succeeds, emits the plugin bundle.
- `lint`: zero warnings (`--max-warnings 0`).

- [ ] **Step 2: Confirm no unrelated local changes were reverted**

Run: `git status`
Expected: only the files this plan touched are staged/modified (`src/constants.ts`, `src/index.ts`, `src/components/Status.svelte`, `src/components/DimensionChart.svelte`, `src/components/props.svelte.ts`, `public/i18n/*.json`). Any pre-existing dirty paths from the session-start git status remain intact (per AGENTS.md "preserve dirty worktree").

- [ ] **Step 3: Report results**

Report exact command output for each gate. Per AGENTS.md, mark the manual smoke test (load plugin in SiYuan, open status panel, confirm Overview KPIs + 7 donut charts render with correct dark/light theming and protyle-icons hidden) as a user-run step — no automated runtime test exists.

No commit in this task (it is verification only). If all gates pass, the feature is complete pending the user's manual smoke test.

---

## Self-Review (run before handoff)

**1. Spec coverage:**
- §3.3 chartRender contract (build DOM + escape + call) → Task 3 (DimensionChart `$effect`). ✓
- §4.1 `DimensionChart.svelte` reusable component → Task 3. ✓
- §4.2 Overview plain-text KPIs → Task 5 Step 2. ✓
- §4.3 Breakdown panel, 7 tabs → Task 5 Step 2. ✓
- §5 hide protyle-icons via scoped CSS → Task 5 Step 3. ✓
- §6 i18n `status` key (en/zh-CN/zh-TW) → Task 1. ✓
- §7 `openStatusPanel` wiring → Task 6. ✓
- §8 error handling (undefined status → noData; empty Category[] → placeholder; chartRender catch) → Task 3 Step 2 (`categories.length === 0` guard) + Task 5 Step 2 (`{#if data}`). ✓
- §9 verification → Task 7. ✓
- §2 non-goals (multi-day, npm echarts, interactive edit) — respected, no task implements them. ✓

**2. Placeholder scan:** No TBD/TODO/"implement later". Every code step has complete code. The only "optional" task (Task 4) is explicitly marked skippable with a concrete default. ✓

**3. Type consistency:**
- `TProps` for `DimensionChart` (Task 3 module script) = `{ categories: Status.Category[]; title: string; plugin: InstanceType<typeof WakaTimePlugin> }`. Task 5 passes exactly `categories={…} title={tab.text} {plugin}`. ✓
- `statusProps` (existing, `props.svelte.ts`) = `{ status?: Status.IResponse; plugin?: WakaTimePlugin }`, matches `Status.TProps` (existing module script). Task 6 passes `props: statusProps`. ✓
- `DimensionKey` values (Task 5) = the 7 `Summary` field names, so `data?.[tab.key as keyof typeof data]` is `Category[]`. `DimensionChart` expects `Status.Category[]`. ✓
- `STATUS_PANEL_DIALOG_ID` constant (Task 2) used in Task 6 as `this.STATUS_PANEL_DIALOG_ID`. ✓
- `i18n.status.*` keys referenced in Tasks 5 & 6 all defined in Task 1. ✓

No issues found.

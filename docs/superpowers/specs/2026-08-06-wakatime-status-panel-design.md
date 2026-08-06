# WakaTime Status Panel — Design

> Date: 2026-08-06
> Scope: Implement `Status.svelte` to render the WakaTime/Wakapi status summary as charts, reusing `plugin.siyuan.ProtyleMethod.chartRender` for echarts rendering.

## 1. Goal

The wakatime plugin already fetches a per-day coding-activity summary
(`Status.IResponse`, broadcast via kernel RPC → `statusProps` reactive store),
but the status panel component ([`Status.svelte`](../../workspace/plugins/wakatime/src/components/Status.svelte))
is an empty template and its entry point
([`openStatusPanel`](../../workspace/plugins/wakatime/src/index.ts))
is an empty stub. This spec defines how to fill both so clicking the status-bar
icon opens a dialog that visualizes today's coding activity.

The user explicitly directed that the panel **reuse the exposed
`plugin.siyuan.ProtyleMethod.chartRender`** render function (the same one the
SiYuan app exposes at [`API.ts:361`](https://github.com/siyuan-note/siyuan/blob/master/app/src/plugin/API.ts)
→ [`ProtyleMethod.chartRender`](https://github.com/siyuan-note/siyuan/blob/master/app/src/plugin/ProtyleMethod.ts)),
see reference implementation
[`chartRender.ts`](https://github.com/siyuan-note/siyuan/blob/master/app/src/protyle/render/chartRender.ts))
rather than loading echarts independently.

## 2. Non-goals

- Historical / multi-day summaries (`Status.Summaries`, the `data: Summary[]`
  range response). The RPC currently broadcasts a single `Summary`; rendering a
  date-range history view is a future enhancement and out of scope.
- New chart libraries or bundling echarts into the plugin. Echarts is loaded
  by `chartRender` from the SiYuan app's stage assets.
- Editing chart options interactively (the "edit" protyle icon is inert in a
  dialog and is hidden — see §5).
- New API endpoints or changes to the kernel fetch path.

## 3. Context & constraints

### 3.1 Status data shape

`Status.IResponse` ([`wakatime.d.ts:154-203`](../../workspace/plugins/wakatime/src/types/wakatime.d.ts#L154-L203)):

```ts
interface IResponse {
    cached_at: string;   // ISO 8601 UTC
    data: Summary;        // single-day summary
}

interface Summary {
    categories: Category[];        // by activity type
    dependencies: Category[];      // by file dependency
    editors: Category[];           // by editor
    grand_total: GrandTotal;       // total across all dimensions
    languages: Category[];         // by language
    machines: Category[];          // by machine (Category.machine_name_id set here)
    operating_systems: Category[]; // by OS
    projects: Category[];          // by project
    range: Range;                  // day metadata
}

interface Category {
    digital: string;        // "HH:MM" clock format
    hours: number;
    machine_name_id?: string; // only in machines[]
    minutes: number;
    name: string;
    percent: number;        // 0..100
    seconds: number;
    text: string;           // human-readable, e.g. "10 hrs 30 mins"
    total_seconds: number;  // canonical measure for chart values
}

interface GrandTotal { digital; hours; minutes; text; total_seconds }
interface Range { date; end; start; text; timezone }
```

### 3.2 Live data flow (already implemented)

```
kernel.getStatus()                          // fetches {api_url}/users/current/statusbar/today
  → this.siyuan.rpc.broadcast(WAKATIME_STATUS, Status.IResponse)
  → index.ts updateWakatimeStatus(status)   // RPC handler bound at onload
  → statusProps.status = status              // $state in props.svelte.ts
  → Status.svelte reads statusProps.status reactively
```

`statusProps` (a module-level `$state` in
[`props.svelte.ts`](../../workspace/plugins/wakatime/src/components/props.svelte.ts))
already holds `{ status?: IResponse, plugin?: WakaTimePlugin }` and is written
by `updateWakatimeStatus`. `Status.svelte`'s `TProps` already matches this
shape. No new data plumbing is required.

### 3.3 chartRender contract (reference)

`plugin.siyuan.ProtyleMethod.chartRender(element: Element, cdn?: string)`
([`chartRender.ts`](https://github.com/siyuan-note/siyuan/blob/master/app/src/protyle/render/chartRender.ts))
expects each chart target to be an element with:

```html
<div data-subtype="echarts" data-content="<HTML-escaped echarts option JSON>">
  <div></div><!-- becomes the render target; chartRender fills it -->
</div>
```

On call it:
1. Loads echarts (+ echarts-gl) from the app stage path via `addScript`
   (`/stage/protyle/js/echarts/echarts.min.js`). Idempotent — re-calls return
   immediately if already loaded.
2. Injects `.protyle-icons` (refresh/edit/more) as the first child of each
   `[data-subtype="echarts"]` node.
3. Reads `data-content`, unescapes via `Lute.UnEscapeHTMLStr`, parses via
   `looseJsonParse`, and calls `echarts.init(target, darkTheme?, {width}).setOption(option)`.
   `darkTheme` is `"dark"` when `window.siyuan.config.appearance.mode === 1`.
4. Wraps the whole body in try/catch and renders a red `.ft__error` div on
   failure — a safety net for malformed options.

**Implication:** the plugin's only responsibilities are (a) build the
`[data-subtype="echarts"]` DOM node, (b) compute a valid echarts option JSON,
(c) HTML-escape it into `data-content`, (d) call `chartRender`. Echarts loading,
theming, init, resize, and error display are owned by `chartRender`.

`Lute` is available globally (the plugin already uses
`siyuanGlobal.Lute.NewNodeID()` in `index.ts`), so `Lute.EscapeHTMLStr` is
available for escaping the option JSON. If escaping is ever found inconsistent
with `Lute.UnEscapeHTMLStr`, fall back to a manual attribute-escape.

### 3.4 Layout reference

[`Settings.svelte`](../../workspace/plugins/wakatime/src/components/Settings.svelte)
establishes the component layout vocabulary to mirror:

- `<Panels>` — left rail of panel switches; `focus` + `let:focus={focusPanel}`.
- `<Panel display={...}>` — one panel's content; toggled via `class:fn__none` /
  `display` prop.
- `<Tabs focus tabs let:focus={focusTab}>` — top tabs within a panel.
- Tab bodies: `<div class:fn__none={key !== focusTab} data-type={name}>…</div>`.

Reusable workspace components live under
`@workspace/components/siyuan/setting/{panel,tab}/`.

### 3.5 i18n

Type-safe i18n via `plugin.i18n` with compile-time parity checks
([`utils/i18n.ts`](../../workspace/plugins/wakatime/src/utils/i18n.ts)); locale
files at `public/i18n/{en,zh-CN,zh-TW}.json`. **There is currently no `status`
i18n key** — one must be added to all three locale files (§6).

### 3.6 Styling

LESS preprocessor (`vite.config.ts: less: true`). Plugin components delegate
styling to workspace components and ship empty `<style lang="less">` blocks.
A small scoped style block is acceptable for panel-local concerns (§5).

## 4. Architecture

```
Status.svelte                       root: layout + data ownership
  ├─ Overview (inline, plain text)   grand_total / range / cached_at KPIs
  └─ <Panels>
       ├─ Panel "overview"           ← focus default
       └─ Panel "breakdown"
            └─ <Tabs>                7 tabs, one per dimension
                 └─ <DimensionChart>  ← reusable, one per tab
```

Two new/edited source files plus i18n + index.ts wiring:

| File | Change |
|---|---|
| `src/components/Status.svelte` | Implement root layout + Overview |
| `src/components/DimensionChart.svelte` | **New.** Reusable chart wrapper |
| `src/components/props.svelte.ts` | Unchanged (already has `statusProps`) |
| `src/index.ts` | Fill `openStatusPanel` stub (§7) |
| `public/i18n/{en,zh-CN,zh-TW}.json` | Add `status` key (§6) |

### 4.1 `DimensionChart.svelte` (new, reusable)

Single component handling all 7 breakdowns (they all share the `Category[]`
shape).

```svelte
<script lang="ts" module>
  import type { Status } from "@/types/wakatime";   // Status.Category, Status.IResponse
  import type WakaTimePlugin from "@/index";

  export interface TProps {
    categories: Status.Category[];       // one breakdown array
    title: string;                       // dimension label (i18n)
    plugin: InstanceType<typeof WakaTimePlugin>;
  }
</script>
```

> `Status.Category` is nested inside the `Status` namespace in
> [`wakatime.d.ts`](../../workspace/plugins/wakatime/src/types/wakatime.d.ts)
> (it is **not** a top-level export), so the import must be
> `import type { Status }` and the type referenced as `Status.Category`. This
> avoids collision with the unrelated heartbeat `Category` enum from
> `@/wakatime/heartbeats`. The existing `Status.svelte` already imports this
> way.

<script lang="ts">
  const { categories, title, plugin }: TProps = $props();
  let container: HTMLDivElement = $state();   // chartRender target root

  // Build the [data-subtype="echarts"] DOM and call chartRender whenever
  // `categories` changes and is non-empty.
  $effect(() => {
    if (!container || categories.length === 0) return;
    const option = buildOption(categories);
    // chartRender expects: <div data-subtype="echarts" data-content="…"><div></div></div>
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

`buildOption(categories)` produces a donut chart:

```ts
function buildOption(categories: Status.Category[]): Record<string, unknown> {
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c}s ({d}%)" },
    legend: { type: "scroll", orient: "vertical", right: 0, top: "middle" },
    series: [{
      type: "pie",
      radius: ["40%", "70%"],          // donut
      avoidLabelOverlap: true,
      label: { show: true, formatter: "{b} {d}%" },
      data: categories
        .filter(c => c.total_seconds > 0)
        .map(c => ({ name: c.name, value: c.total_seconds })),
    }],
  };
}
```

- `value: total_seconds` is the canonical duration measure (not `percent`,
  which is pre-rounded; echarts recomputes the share from values).
- Empty input (`categories.length === 0` or all-zero) short-circuits before
  calling `chartRender` and renders the `status.noData` placeholder instead.

> **Note on echarts types:** the `echarts` npm package is not a plugin
> dependency and will not be added. `buildOption` returns a plain object typed
> as `Record<string, unknown>` (or a locally-declared minimal option interface);
> the `echarts.EChartsCoreOption` annotation above is illustrative only. No
> `import` of echarts occurs — the object is serialized to `data-content` and
> consumed by `chartRender`.

### 4.2 Overview panel

Plain HTML (no chart). Renders, from `status.data`:

- `grand_total.text` (e.g. "10 hrs 30 mins") + `grand_total.digital` ("10:30")
  as the primary KPI.
- `range.text` (e.g. "Today"), `range.date`, `range.timezone`.
- `cached_at` timestamp (formatted via `Intl.DateTimeFormat`).
- A `testService` affordance when `status` is `undefined` (calls
  `plugin.testService()` to surface connectivity).

### 4.3 Breakdown panel

`<Tabs>` with 7 entries, each rendering `<DimensionChart>` against the
matching `status.data.<dimension>` array:

| Tab key | `status.data` field |
|---|---|
| `languages` | `languages` |
| `editors` | `editors` |
| `projects` | `projects` |
| `operating_systems` | `operating_systems` |
| `machines` | `machines` |
| `categories` | `categories` |
| `dependencies` | `dependencies` |

Default focus: `languages` (most-consulted dimension).

## 5. Protyle-icons handling

`chartRender` injects `.protyle-icons` (refresh/edit/more) as the first child
of each chart node. In the SiYuan app these are wired by protyle's gutter
handlers, which are absent in a plugin dialog — the icons would be inert
decoration. Hide them with a scoped style in `Status.svelte`:

```less
:global(.b3-dialog__content) .status-panel .protyle-icons {
    display: none;
}
```

This is non-invasive: it does not alter `chartRender`'s behavior or DOM
structure, only the presentation inside this panel. Scoped to `.status-panel`
so it cannot leak into protyle editors elsewhere.

## 6. i18n additions

Add a top-level `status` key to all three locale files. Schema (en shown;
zh-CN/zh-TW parallel):

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

The `utils/i18n.ts` parity check enforces identical shape across locales, so
all three files must be updated together.

## 7. `openStatusPanel` wiring (index.ts)

Fill the stub at [`index.ts:304`](../../workspace/plugins/wakatime/src/index.ts#L304),
mirroring `openSetting()`:

```ts
protected readonly openStatusPanel = () => {
  const dialog = new siyuan.Dialog({
    title: `${this.i18n.status.title} <code class="fn__code">${this.name}</code>`,
    content: `<div id="${this.STATUS_DIALOG_ID}" class="fn__flex-column" />`,
    width: FLAG_MOBILE ? "92vw" : "720px",
    height: FLAG_MOBILE ? undefined : "640px",
  });
  const target = dialog.element.querySelector(`#${this.STATUS_DIALOG_ID}`);
  if (target) {
    mount(Status, { target, props: statusProps });
  }
};
```

Notes:
- `STATUS_DIALOG_ID` — the existing constant used by `openSetting()`. Either
  reuse it (a status dialog and a settings dialog are not open simultaneously,
  so ID collision is not a concern) or add a sibling `STATUS_PANEL_DIALOG_ID`.
  **Decision: add a new `STATUS_PANEL_DIALOG_ID` constant** to keep IDs
  purpose-named and avoid any latent selector collision if both ever render.
- Import `Status` at the top of `index.ts` (currently only `Settings` is
  imported).
- `statusProps` already carries the live `status` + `plugin`; pass it directly
  as Svelte 5 props. `mount` is already imported.

## 8. Error handling

| Condition | Behavior |
|---|---|
| `status === undefined` (no RPC data yet) | Overview shows `status.noData` + a `testService` button; Breakdown tabs show placeholders |
| `status.data` present but a dimension `Category[]` is empty | That tab shows `status.noData` placeholder; `chartRender` is **not** called (avoids rendering an empty pie) |
| `chartRender` throws on a bad option | `chartRender`'s own catch renders a red `.ft__error` div. Our option JSON is controlled/static, so this is a safety net, not an expected path |
| `Lute` unavailable | Treat as a fatal environment error; log via `plugin.logger`. (Plugin already assumes `Lute` exists at `index.ts:321`.) |

No new error paths are introduced beyond guarding the empty-data case before
calling `chartRender`.

## 9. Testing & verification

No repository-wide test suite exists (per AGENTS.md, TODO). Verification:

1. **Type-check:** `pnpm -C workspace --filter wakatime run check:svelte`
   — must pass (the only acceptable pre-existing error is the unrelated
   `IObject is declared but never used` in vendored `siyuan/types/constants.ts`).
2. **Build:** `pnpm -C workspace --filter wakatime run build:plugin`
   — must succeed (validates the new component compiles and is bundled).
3. **Lint:** `pnpm -C workspace --filter wakatime run lint` — zero warnings.
4. **Manual smoke (user-run):** load plugin in SiYuan, open status panel from
   the status-bar icon, confirm Overview KPIs + 7 donut charts render with
   correct dark/light theming and that protyle-icons are hidden.

## 10. Out-of-scope / future

- Multi-day range view (`Status.Summaries`, `data: Summary[]`).
- Chart-type selection (bar/rank lists alongside donuts) — deferred per design
  decision (donut-only for all dimensions in this iteration).
- A refresh button in the dialog that triggers `plugin.testService()` /
  re-fetches status (currently status updates only on the kernel's 60s
  broadcast interval).
- Resizing charts on dialog resize — `chartRender` initializes with the
  container width at call time; a `$effect` on container resize could call
  `echarts.getInstanceById(...).resize()`, but the default dialog size is fixed
  so this is deferred.

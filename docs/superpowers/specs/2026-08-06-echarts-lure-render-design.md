# echarts 渲染：chartRender 诱饵加载 + 手动 init

- 日期: 2026-08-06
- 范围: `workspace/plugins/wakatime/src/components/DimensionChart.svelte`、`workspace/plugins/wakatime/src/components/Status.svelte`
- 状态: 已确认设计

## 背景

`DimensionChart.svelte` 当前在 `$effect` 中构造一个 `[data-subtype="echarts"]` DOM，把 echarts option 序列化进 `data-content`，然后调用 `plugin.siyuan.ProtyleMethod.chartRender(node)` 让内核完成渲染。

该方案有两个问题：

1. **DOM 突变污染。** `chartRender` 在被调用节点上注入 `protyle-icons`（刷新/编辑/更多，见 `app/src/protyle/render/util.ts` 的 `genIconHTML`）。这些图标在状态面板对话框中无对应处理器，只能用 CSS 隐藏。`Status.svelte` 第 155–158 行的 `:global(.b3-dialog__content) .status-panel .protyle-icons { display: none; }` 即为此而存在的 hack。
2. **对内核 DOM 结构的隐式依赖。** `chartRender` 还会写入 `data-render`、ZWSP 占位符、`renderElement.lastElementChild` 等，插件不应依赖这些内部细节。

但 `chartRender` 是插件能触达 echarts 脚本加载的**唯一**入口：`addScript` 与 `Constants.PROTYLE_CDN` 都属于内核内部实现，不向插件导出。`chartRender` 内部对 `echarts.min.js?v=5.3.2`（id `protyleEchartsScript`）和 `echarts-gl.min.js?v=2.0.9`（id `protyleEchartsGLScript`）调用 `addScript`，后者按 id 去重，首次加载后脚本常驻 `<head>`、`window.echarts` 随后可用。

`ISiyuanGlobal.echarts?: typeof import("echarts")`（`workspace/packages/types/siyuan/index.d.ts:77`，经 `workspace/packages/types/global/index.d.ts` 扩展到 `Window`）已为插件声明全局 `echarts` 类型，因此手动 `window.echarts.init(...)` 可通过类型检查。

## 目标

- 仍由 `chartRender` 触发 echarts 脚本加载（保持 CDN 与版本与内核一致，不硬编码 URL）。
- 真实图表容器**不再被 `chartRender` 触碰**：不注入 `protyle-icons`、不写 `data-render`/ZWSP。
- 图表由插件手动 `window.echarts.init(...).setOption(...)` 渲染到真实容器。
- 移除 `Status.svelte` 中用于隐藏图标的 CSS hack。
- 复用同一份 `buildOption` 逻辑，option 形状不变。

## 非目标

- 不自建 `<script>` 加载 echarts（那会绕过 `chartRender`、且拿不到 CDN 常量）。
- 不改变 `DimensionChart` 的 props/slots/handlers 接口。
- 不改变图表视觉外观（donut + 垂直滚动图例 + 百分比 label）。

## 设计

### 组件接口（不变）

`IProps` / `IHandlers` / `ISlots` / `TProps` 保持现状：

```ts
export interface IProps {
    categories: Status.Category[];
    title: string;
    plugin: InstanceType<typeof WakaTimePlugin>;
}
```

`buildOption(cats)` 不变。

### 渲染流程（`$effect` 重写）

`$effect` 在 `categories` / `container` 变化时重新执行，按以下顺序：

1. **守卫。** `!container || categories.length === 0` 时直接返回，交由模板的 `{#if categories.length === 0}` 渲染空态。
2. **构建 option。** `const option = buildOption(categories);`
3. **诱饵加载 echarts。** 构造一个**脱离 DOM** 的节点：

   ```ts
   const decoy = document.createElement("div");
   decoy.setAttribute("data-subtype", "echarts");
   // 不设 data-content、不 appendChild
   plugin.siyuan.ProtyleMethod.chartRender(decoy);
   ```

   因为 decoy 有 `data-subtype="echarts"` 且无 `data-content`，`chartRender` 会执行其 `addScript` 链（echarts + echarts-gl，按 id 去重 → 首次加载后常驻），在 decoy 上写 `data-render`/icons/ZWSP，然后于 `if (!e.getAttribute("data-content"))` 分支提前 `return`——**不触碰真实容器，不调用 `echarts.init`**。
4. **轮询就绪。** 等待 `globalThis.echarts` 定义后继续。为防 CDN 失败（`addScript` 出错时 resolve `false`，`window.echarts` 永不出现），轮询带最大次数上限；到顶则在容器内显示 `ft__error` 错误态并停止。轮询期间若组件已卸载（teardown 标记），立即退出。
5. **手动 init。**

   ```ts
   const dark = globalThis.siyuan.config.appearance.mode === 1; // 0 light / 1 dark，与 chartRender 同源
   const instance = globalThis.echarts.init(container, dark ? "dark" : undefined);
   instance.setOption(option);
   ```

   `container` 已有 `height:420px; width:100%`，echarts 可直接读取其 `clientWidth`，故不传 `{width}`。
6. **清理。** `$effect` 返回 teardown：

   ```ts
   return () => {
       if (instance) globalThis.echarts.dispose(instance);
   };
   ```

   组件卸载或 `categories` 再次变化触发重跑时释放实例，避免 echarts instance 泄漏。

### 错误处理

- **脚本加载失败**：轮询到最大次数仍无 `globalThis.echarts` → 在 `container` 内渲染 `<div class="ft__error">…</div>`，文案用 `i18n.status.noData` 或类似的「图表加载失败」措辞（沿用现有空态文案，避免新增 i18n key；如确需区分，标记 TODO）。
- **`setOption` 抛错**：try/catch，捕获后 `echarts.dispose(instance)` 并在容器内显示 `ft__error`，镜像 `chartRender` 的错误展示约定。

### Status.svelte CSS 清理

删除 `Status.svelte` 第 155–158 行：

```less
/* chartRender 注入的 protyle-icons (刷新/编辑/更多) 在对话框中无对应处理器，隐藏 */
:global(.b3-dialog__content) .status-panel .protyle-icons {
    display: none;
}
```

新流程不再向真实容器注入 `protyle-icons`，该规则失效，连同注释一并移除。

### 不变项

- 模块的 `<script module>` 块（`IProps`/`IHandlers`/`ISlots`/`TProps`）。
- `buildOption`（tooltip/legend/series 的 pie 环形配置）。
- 空态标记与 `.dimension-chart__title` / `__container` / `__empty` 样式。
- `container` 的 `$state` 与其 `protyle-wysiwyg` class（对新流程无害；保留以减少无关改动）。

## 验证

- `pnpm -C workspace --filter @siyuan-community/plugin-wakatime run lint`
- `pnpm -C workspace --filter @siyuan-community/plugin-wakatime run build`（确认 `globalThis.echarts` 类型可解析）
- 手动：打开 WakaTime 状态面板
  - 环形图正常渲染；
  - 无 `protyle-icons`（刷新/编辑/更多）出现；
  - 切换 breakdown tab 可重新渲染、无遗留实例。

## 风险与备注

- **轮询 vs 事件**：`chartRender` 返回 `void`，无加载完成回调；`addScript` 的 script `id`（`protyleEchartsScript`）load 事件理论上可监听，但该 script 元素由内核创建/移除，监听其生命周期更脆弱。轮询 `globalThis.echarts` 是最稳健且无侵入的方式，配最大次数兜底。
- **多实例并发**：状态面板同时只有一个 `DimensionChart` 实例（tab 切换互斥）。即便多个，`addScript` 按 id 去重，第二个实例轮询首帧即命中。
- **Date.now 限制**：本工作流脚本环境禁用 `Date.now()`/`new Date()`，但这是 Svelte 组件运行时代码（浏览器侧），不受此限制。轮询用 `setInterval`/`setTimeout`，不依赖 `Date`。

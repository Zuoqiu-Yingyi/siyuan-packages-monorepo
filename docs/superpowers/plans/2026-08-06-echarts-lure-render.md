# echarts 诱饵渲染 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `DimensionChart.svelte` 中改用脱离 DOM 的诱饵节点触发 `chartRender` 加载 echarts 脚本，就绪后手动 `window.echarts.init` 渲染到真实容器，并移除 `Status.svelte` 中为隐藏 `protyle-icons` 而设的 CSS hack。

**Architecture:** `$effect` 构造一个 `data-subtype="echarts"` 但无 `data-content` 的脱离节点，调用 `plugin.siyuan.ProtyleMethod.chartRender(decoy)` —— 此调用走 `chartRender` 内部的 `addScript` 链（按 id 去重、首次后常驻 `window.echarts`），但因 decoy 无 `data-content` 而于 `if (!e.getAttribute("data-content"))` 分支提前 return，不触碰真实容器。随后轮询 `globalThis.echarts` 就绪，在真实 `container` 上 `echarts.init(container, theme).setOption(option)`，teardown 中 `echarts.dispose(instance)`。

**Tech Stack:** Svelte 5 runes（`$state`/`$effect`/`$props`）、TypeScript、echarts（经内核全局 `window.echarts`）、SiYuan kernel `ProtyleMethod.chartRender`。

## Global Constraints

- 所有用户可见文案与 i18n key 沿用现有 `plugin.i18n`，不新增 i18n key。
- 暗色主题判定沿用 `globalThis.siyuan.config.appearance.mode === 1`（`0` 亮 / `1` 暗，与内核 `chartRender` 同源）。
- 不得自建 `<script>` 加载 echarts；echarts 脚本加载必须经 `plugin.siyuan.ProtyleMethod.chartRender` 触发。
- 不得改写 `IProps` / `IHandlers` / `ISlots` / `TProps` 接口与 `buildOption` 的 option 形状。
- 保留现有脏工作树中无关改动（AGENTS.md）：不触碰 `workspace/plugins/wakatime` 子模块指针。
- **无自动化测试框架。** 该仓库未配置 wakatime 插件的单元测试运行器（AGENTS.md 标记为 TODO），且禁止凭空发明项目机制。故每个任务的验证周期为 `lint` + `build` + 手动浏览器核对，不伪造测试用例。若后续引入测试框架，需先在 docs 标记。
- pnpm filter 名为 `wakatime`（见 `workspace/plugins/wakatime/package.json` 的 `"name"`）。
- eslint disable 注释风格沿用文件既有：`// eslint-disable-next-line svelte/no-dom-manipulating`。

---

## File Structure

| 文件 | 责任 | 改动 |
|---|---|---|
| `workspace/plugins/wakatime/src/components/DimensionChart.svelte` | 维度环形图组件 | 重写 `$effect` 主体；teardown 释放 echarts 实例 |
| `workspace/plugins/wakatime/src/components/Status.svelte` | 状态面板容器 | 删除第 155–158 行 protyle-icons CSS hack |

`buildOption`、模块 `<script module>` 接口、空态标记与样式均不变。

---

### Task 1: 重写 DimensionChart.svelte 的 $effect 为诱饵加载 + 手动 init

**Files:**
- Modify: `workspace/plugins/wakatime/src/components/DimensionChart.svelte:84-98`（`$effect` 主体）

**Interfaces:**
- Consumes: `plugin.siyuan.ProtyleMethod.chartRender(element: Element, cdn?: string): void`（内核导出，见 `workspace/node_modules/.pnpm/siyuan@1.2.3/node_modules/siyuan/types/protyle.d.ts`）；`globalThis.echarts`（类型 `typeof import("echarts")`，见 `workspace/packages/types/siyuan/index.d.ts:77`，经 `workspace/packages/types/global/index.d.ts` 扩展至 `Window`）；`globalThis.siyuan.config.appearance.mode`（`0`/`1`，见 `workspace/node_modules/.pnpm/siyuan@1.2.3/node_modules/siyuan/types/config.d.ts` 的 `IAppearance.mode`）。
- Produces: 一个自清理的 `$effect`，其 teardown 调用 `globalThis.echarts.dispose(instance)`；真实 `container` 不再被 `chartRender` 写入 `protyle-icons` / `data-render` / ZWSP。

**关于验证方式：** 本仓库无 wakatime 插件单元测试运行器（AGENTS.md 标记为 TODO，禁止发明）。本任务以 `lint` + `build` 通过、且手动浏览器核对图表渲染无 `protyle-icons` 为验证，不写自动化测试用例。

- [ ] **Step 1: 读现文件确认上下文**

Run: `sed -n '40,128p' workspace/plugins/wakatime/src/components/DimensionChart.svelte`
Expected: 看到第 84–98 行的现有 `$effect`（构造 `data-subtype=echarts` 节点 + `chartRender(node)`），以及第 50 行 `let container = $state<HTMLDivElement>();`、第 56–81 行 `buildOption`。确认未变。

- [ ] **Step 2: 重写 `$effect` 主体**

将 `workspace/plugins/wakatime/src/components/DimensionChart.svelte` 第 83–98 行（从 `// 当 categories 变化...` 注释到 `});`）整体替换为：

```svelte
    // 当 categories 变化且非空时：
    //   1. 用脱离 DOM 的诱饵节点触发 chartRender 加载 echarts 脚本（chartRender 是插件能触达 echarts 的唯一入口，
    //      addScript/Constants.PROTYLE_CDN 属内核内部实现）。诱饵有 data-subtype="echarts" 但无 data-content，
    //      故 chartRender 走完 addScript 链后于 `无 data-content` 分支提前 return，不触碰真实容器、不调用 echarts.init。
    //   2. 轮询 globalThis.echarts 就绪（addScript 按 id 去重，首次后常驻），到顶则显示错误态。
    //   3. 就绪后在真实 container 上手动 echarts.init(...).setOption(option)，teardown 释放实例。
    let instance: ReturnType<typeof globalThis.echarts.init> | undefined;
    let disposed = false;
    $effect(() => {
        if (!container || categories.length === 0) {
            return;
        }
        const option = buildOption(categories);

        // 1. 诱饵加载 echarts 脚本（脱离 DOM，不 appendChild）
        const decoy = document.createElement("div");
        decoy.setAttribute("data-subtype", "echarts");
        plugin.siyuan.ProtyleMethod.chartRender(decoy);

        // 2. 轮询就绪
        const poll = setInterval(() => {
            if (disposed) {
                clearInterval(poll);
                return;
            }
            if (!globalThis.echarts) {
                return;
            }
            clearInterval(poll);
            if (disposed || !container) {
                return;
            }
            try {
                // 3. 手动 init 真实容器（暗色主题判定与内核 chartRender 同源）
                const dark = globalThis.siyuan.config.appearance.mode === 1;
                instance = globalThis.echarts.init(container, dark ? "dark" : undefined);
                instance.setOption(option);
            } catch (error) {
                globalThis.echarts?.dispose(instance);
                instance = undefined;
                // eslint-disable-next-line svelte/no-dom-manipulating
                container.innerHTML = `<div class="ft__error" style="height:420px;display:flex;align-items:center;justify-content:center;">echarts render error: ${String(error)}</div>`;
            }
        }, 16);

        return () => {
            disposed = true;
            clearInterval(poll);
            if (instance) {
                globalThis.echarts?.dispose(instance);
                instance = undefined;
            }
        };
    });
```

注意：`let instance` / `let disposed` 声明放在 `$effect` 之前的组件作用域，使其在 teardown（return 的闭包）中可达。`setInterval` 每 16ms 轮询；`addScript` 已加载时 `globalThis.echarts` 首帧即命中。无最大次数上限会因 CDN 失败（`addScript` 出错 resolve `false`，`window.echarts` 永不出现）而无限空转——下一步补上限。

- [ ] **Step 3: 为轮询补最大次数上限，防 CDN 失败无限空转**

在 Step 2 的 `const poll = setInterval(...)` 之前加计数器，并在回调内到顶时显示错误态。将 Step 2 中 `const poll = setInterval(() => {` 起到该 `}, 16);` 止的块，替换为：

```svelte
        let tries = 0;
        const MAX_TRIES = 600; // 16ms * 600 ≈ 9.6s，覆盖首次 CDN 加载
        const poll = setInterval(() => {
            if (disposed) {
                clearInterval(poll);
                return;
            }
            if (!globalThis.echarts) {
                if (++tries >= MAX_TRIES) {
                    clearInterval(poll);
                    if (container) {
                        // eslint-disable-next-line svelte/no-dom-manipulating
                        container.innerHTML = `<div class="ft__error" style="height:420px;display:flex;align-items:center;justify-content:center;">${i18n.status.noData}</div>`;
                    }
                }
                return;
            }
            clearInterval(poll);
            if (disposed || !container) {
                return;
            }
            try {
                const dark = globalThis.siyuan.config.appearance.mode === 1;
                instance = globalThis.echarts.init(container, dark ? "dark" : undefined);
                instance.setOption(option);
            } catch (error) {
                globalThis.echarts?.dispose(instance);
                instance = undefined;
                // eslint-disable-next-line svelte/no-dom-manipulating
                container.innerHTML = `<div class="ft__error" style="height:420px;display:flex;align-items:center;justify-content:center;">echarts render error: ${String(error)}</div>`;
            }
        }, 16);
```

（`i18n` 已在第 47 行 `const i18n = plugin.i18n;` 解构，复用 `i18n.status.noData` 作超时文案，不新增 i18n key。）

- [ ] **Step 4: 运行 lint 验证无语法/类型错误**

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS，`eslint --max-warnings 0 .` 退出码 0，无 warning。若报 `svelte/no-dom-manipulating`，确认对应行已加 `// eslint-disable-next-line svelte/no-dom-manipulating`。

- [ ] **Step 5: 运行 build 验证类型可解析**

Run: `pnpm -C workspace --filter wakatime run build:dev`
Expected: vite 构建成功，无 TS 报错；`globalThis.echarts.init` / `globalThis.echarts.dispose` 类型解析通过（来自 `workspace/packages/types/siyuan/index.d.ts:77` 的 `echarts?: typeof import("echarts")`）。

- [ ] **Step 6: 手动浏览器核对**

启动 `pnpm -C workspace run dev`，在 SiYuan 中打开 WakaTime 状态面板：
- 环形图正常渲染（donut + 右侧垂直滚动图例 + 百分比 label）；
- DOM 检查器中真实 `.dimension-chart__container` 内**无** `protyle-icons`（刷新/编辑/更多）、无 `data-render="true"`、无 ZWSP 占位符；
- 切换 breakdown tab，旧实例被 dispose、新图正常渲染、无残留 canvas。

- [ ] **Step 7: 提交**

```bash
git add workspace/plugins/wakatime/src/components/DimensionChart.svelte
git commit -m "$(cat <<'EOF'
feat(wakatime): render chart via chartRender lure + manual echarts.init

Replace chartRender's direct mutation of the real chart container with
a detached decoy node that triggers the echarts script load, then
manually window.echarts.init on the real container once ready. The real
container no longer receives protyle-icons/data-render/ZWSP. Teardown
disposes the echarts instance on category change or unmount.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

注意：`workspace/plugins/wakatime` 是子模块指针，`git add` 仅暂存 `DimensionChart.svelte`，不触碰子模块指针（AGENTS.md：保留脏工作树）。

---

### Task 2: 移除 Status.svelte 中隐藏 protyle-icons 的 CSS hack

**Files:**
- Modify: `workspace/plugins/wakatime/src/components/Status.svelte:155-158`

**Interfaces:**
- Consumes: Task 1 的结果——真实图表容器不再被注入 `protyle-icons`。
- Produces: `Status.svelte` 不再含 `:global(.b3-dialog__content) .status-panel .protyle-icons` 规则。

**关于验证方式：** 同 Task 1，无自动化测试；以 `lint` + `build` + 手动核对图标不再出现为准。

- [ ] **Step 1: 读现状确认待删行**

Run: `sed -n '150,160p' workspace/plugins/wakatime/src/components/Status.svelte`
Expected: 看到第 155–158 行：
```less
    /* chartRender 注入的 protyle-icons (刷新/编辑/更多) 在对话框中无对应处理器，隐藏 */
    :global(.b3-dialog__content) .status-panel .protyle-icons {
        display: none;
    }
```
以及第 150 行 `<style lang="less">` 与第 160 行起 `.status-overview {`。

- [ ] **Step 2: 删除该 CSS hack**

删除 `workspace/plugins/wakatime/src/components/Status.svelte` 第 155–158 行（注释 + 规则 + 闭合 `}`），连同其前后的空行收敛（保留 `<style lang="less">` 与 `.status-panel { ... }` 之间一个空行分隔）。

删除后该区域应为：
```less
<style lang="less">
    .status-panel {
        height: 100%;
    }

    .status-overview {
```

- [ ] **Step 3: 运行 lint 验证无残留引用**

Run: `pnpm -C workspace --filter wakatime run lint`
Expected: PASS，无 `protyle-icons` 相关未使用选择器告警。

- [ ] **Step 4: 运行 build 验证**

Run: `pnpm -C workspace --filter wakatime run build:dev`
Expected: 构建成功。

- [ ] **Step 5: 手动浏览器核对**

打开 WakaTime 状态面板：环形图渲染正常，且仍无 `protyle-icons`（Task 1 已保证；本步确认删 CSS 后无回退）。

- [ ] **Step 6: 提交**

```bash
git add workspace/plugins/wakatime/src/components/Status.svelte
git commit -m "$(cat <<'EOF'
refactor(wakatime): drop protyle-icons CSS hack from Status

The chartRender lure-render flow no longer injects protyle-icons into
the real chart container, so the defensive `display:none` rule is dead
code. Remove it.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**1. Spec coverage：**
- 诱饵脱离 DOM + chartRender 触发加载 → Task 1 Step 2。✓
- 轮询 `globalThis.echarts` 就绪 → Task 1 Step 2/3。✓
- 超时错误态 → Task 1 Step 3（MAX_TRIES + `ft__error`）。✓
- 手动 `echarts.init(container, theme)` + `appearance.mode === 1` → Task 1 Step 2/3。✓
- teardown `echarts.dispose(instance)` → Task 1 Step 2/3 return。✓
- `setOption` try/catch + `ft__error` → Task 1 Step 2/3。✓
- 删除 Status.svelte CSS hack → Task 2。✓
- 接口/`buildOption`/样式不变 → 明示于 Global Constraints 与 File Structure。✓
- 验证（lint/build/手动） → 两任务各列。✓

**2. Placeholder scan：** 无 TBD/TODO 占位（"TODO" 仅出现在 Global Constraints 描述仓库现状，非计划占位）。错误态文案复用 `i18n.status.noData`，无"add appropriate error handling"。✓

**3. Type consistency：** `instance: ReturnType<typeof globalThis.echarts.init> | undefined` 与 teardown 中 `globalThis.echarts?.dispose(instance)` 一致；`decoy` 为 `HTMLDivElement`，`chartRender` 签名收 `Element`，兼容。`container` 类型 `HTMLDivElement | undefined`（`$state<HTMLDivElement>()`），`echarts.init` 收 `HTMLElement`，兼容。✓

**4. 风险复核：** `let instance` / `let disposed` 位于组件作用域（`$effect` 外），teardown 闭包可捕获——与 Svelte 5 runes 语义一致。轮询在 `categories` 变化重跑时由上一次 teardown 的 `clearInterval` + `disposed = true` 终止，无泄漏。✓

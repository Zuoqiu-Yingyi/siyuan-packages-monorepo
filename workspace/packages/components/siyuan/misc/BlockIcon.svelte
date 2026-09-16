<!--
 Copyright (C) 2023 Zuoqiu Yingyi

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<script
    lang="ts"
    module
>
    import type {
        IBlockIconProps,
        IBlockIconStatus,
    } from "./index";

    export interface IProps {
        icon?: NonNullable<IBlockIconStatus["icon"]>; // svg 图标引用 ID
        tag?: NonNullable<IBlockIconStatus["tag"]>; // 元素 HTML 标签名称
        show?: NonNullable<IBlockIconStatus["show"]>; // 是否显示 .block__icon--show (opacity: 1)
        none?: NonNullable<IBlockIconStatus["none"]>; // 是否隐藏 .fn__none (display: none)
        active?: NonNullable<IBlockIconStatus["active"]>; // 是否激活 .toolbar__item--active
        disabled?: NonNullable<IBlockIconStatus["disabled"]>; // 是否禁用 .toolbar__item--disabled
        type?: NonNullable<IBlockIconStatus["type"]>; // data-type
        ariaLabel?: NonNullable<IBlockIconStatus["ariaLabel"]>; // 提示标签内容 aria-label
        tooltipsDirection?: NonNullable<IBlockIconStatus["tooltipsDirection"]>; // 提示标签方向
    }

    export interface IHandlers {
        onClick?: NonNullable<IBlockIconProps["onClick"]>; // 按钮点击回调函数
        ondblclick?: (event: MouseEvent) => void; // 按钮双击事件
    }

    export type TProps = IProps & IHandlers;
</script>

<script lang="ts">
    import { writable } from "svelte/store";

    import { TooltipsDirection } from "./tooltips";

    import Svg from "./Svg.svelte";

    import type { IBlockIconStores } from "./index";

    const {
        icon = "#iconHelp",

        tag = "button",
        show = true,
        none = false,
        active = false,
        disabled = false,

        type = "",
        ariaLabel = "",
        tooltipsDirection = TooltipsDirection.none,

        onClick = () => null,
        ondblclick,
    }: TProps = $props();

    let element: HTMLElement | undefined;

    export function rect(): DOMRect | undefined {
        return element?.getBoundingClientRect();
    }

    /**
     * 外部响应式变量
     * 组件内部的渲染以这些 store 为准, 因此外部通过 store 写入的状态会立即反映到视图上
     * 这里仅使用属性的初值播种, 后续变更由下方的 `$effect` 同步, 因此无需在闭包中读取属性
     */
    // svelte-ignore state_referenced_locally
    const iconStore = writable(icon);
    // svelte-ignore state_referenced_locally
    const showStore = writable(show);
    // svelte-ignore state_referenced_locally
    const noneStore = writable(none);
    // svelte-ignore state_referenced_locally
    const activeStore = writable(active);
    // svelte-ignore state_referenced_locally
    const disabledStore = writable(disabled);
    // svelte-ignore state_referenced_locally
    const typeStore = writable(type);
    // svelte-ignore state_referenced_locally
    const ariaLabelStore = writable(ariaLabel);
    // svelte-ignore state_referenced_locally
    const tooltipsDirectionStore = writable(tooltipsDirection);

    const stores = {
        icon: iconStore,
        show: showStore,
        none: noneStore,
        active: activeStore,
        disabled: disabledStore,
        type: typeStore,
        ariaLabel: ariaLabelStore,
        tooltipsDirection: tooltipsDirectionStore,
    } as const satisfies IBlockIconStores;

    /* 属性变更时同步至 store */
    $effect(() => void iconStore.set(icon));
    $effect(() => void showStore.set(show));
    $effect(() => void noneStore.set(none));
    $effect(() => void activeStore.set(active));
    $effect(() => void disabledStore.set(disabled));
    $effect(() => void typeStore.set(type));
    $effect(() => void ariaLabelStore.set(ariaLabel));
    $effect(() => void tooltipsDirectionStore.set(tooltipsDirection));
</script>

<!--
    动态标签名
    REF: https://svelte.dev/docs/special-elements#svelte-element
-->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<svelte:element
    this={tag}
    bind:this={element}
    class="block__icon fn__flex-center {$tooltipsDirectionStore}"
    class:b3-tooltips={$tooltipsDirectionStore !== TooltipsDirection.none}
    class:block__icon--show={$showStore}
    class:fn__none={$noneStore}
    class:toolbar__item--active={$activeStore}
    class:toolbar__item--disabled={$disabledStore}
    data-type={$typeStore}
    aria-label={$ariaLabelStore}
    onclick={(e: MouseEvent) => onClick(e, element!, stores)}
    {ondblclick}
    role="button"
>
    <Svg icon={$iconStore} />
</svelte:element>

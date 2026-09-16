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
    import type { IFileTreeHandlers, IFileTreeNode } from ".";

    export interface IProps extends IFileTreeNode {}

    export type TProps = IProps & IFileTreeHandlers;
</script>

<script lang="ts">
    import { getContext, onDestroy } from "svelte";
    import { fromStore, writable } from "svelte/store";

    import {
        preventDefault,
        stopPropagation,
    } from "@workspace/utils/svelte/event";

    import { FileTreeNodeType } from ".";

    import Icon from "./../../misc/Icon.svelte";
    import Svg from "./../../misc/Svg.svelte";
    import SvgArrow from "./../../misc/SvgArrow.svelte";
    import Node from "./Node.svelte";

    import type { IFileTreeNodeStores, ITree } from ".";

    const {
        type,
        name = "",
        path,
        root = "",
        depth = 0,
        indent = "1em",
        relative = "",
        directory,

        focus = false,
        folded = true,
        symlink = false,
        dragging = false,
        draggable = false,
        hideActions = true,

        dragoverTop = false,
        dragover = false,
        dragoverBottom = false,

        title = "",
        children = undefined,

        toggleIcon = "#iconRight",
        toggleAriaLabel = "",

        icon = "",
        iconAriaLabel = "",
        iconPopoverID = "",

        text = "",
        textAriaLabel = "",

        menuIcon = "#iconMore",
        menuAriaLabel = "",

        symlinkIcon = "#iconLink",
        symlinkAriaLabel = "",

        count = Number.NaN,
        countAriaLabel = "",

        onOpen,
        onMenu,
        onFold,
        onUnfold,
        onDrag,
        onDragstart,
        onDragend,
        onDragenter,
        onDragover,
        onDragleave,
        onDrop,
    }: TProps = $props();

    let li: HTMLLIElement | undefined; // 当前节点元素
    let ul: HTMLUListElement | undefined; // 下级节点列表元素

    /* 外部响应式变量 */
    const props: IFileTreeNodeStores = {
        type: writable(type),
        name: writable(name),
        path: writable(path),
        root: writable(root),
        depth: writable(depth),
        indent: writable(indent),
        relative: writable(relative),
        directory: writable(directory),

        focus: writable(focus),
        folded: writable(folded),
        symlink: writable(symlink),
        dragging: writable(dragging),
        draggable: writable(draggable),
        hideActions: writable(hideActions),

        dragoverTop: writable(dragoverTop),
        dragover: writable(dragover),
        dragoverBottom: writable(dragoverBottom),

        title: writable(title),
        children: writable(children),

        toggleIcon: writable(toggleIcon),
        toggleAriaLabel: writable(toggleAriaLabel),

        icon: writable(icon),
        iconAriaLabel: writable(iconAriaLabel),
        iconPopoverID: writable(iconPopoverID),

        text: writable(text),
        textAriaLabel: writable(textAriaLabel),

        menuIcon: writable(menuIcon),
        menuAriaLabel: writable(menuAriaLabel),

        symlinkIcon: writable(symlinkIcon),
        symlinkAriaLabel: writable(symlinkAriaLabel),

        count: writable(count),
        countAriaLabel: writable(countAriaLabel),
    };

    /**
     * store 的响应式视图
     * 组件内部的渲染以 store 为准, 因此外部通过 store 写入的状态会立即反映到视图上
     * REF: https://svelte.dev/docs/svelte/svelte-store#fromStore
     */
    const state = {
        type: fromStore(props.type),
        name: fromStore(props.name),
        path: fromStore(props.path),
        depth: fromStore(props.depth),
        indent: fromStore(props.indent),
        directory: fromStore(props.directory),

        focus: fromStore(props.focus),
        folded: fromStore(props.folded),
        symlink: fromStore(props.symlink),
        dragging: fromStore(props.dragging),
        draggable: fromStore(props.draggable),
        hideActions: fromStore(props.hideActions),

        dragoverTop: fromStore(props.dragoverTop),
        dragover: fromStore(props.dragover),
        dragoverBottom: fromStore(props.dragoverBottom),

        title: fromStore(props.title),
        children: fromStore(props.children),

        toggleIcon: fromStore(props.toggleIcon),
        toggleAriaLabel: fromStore(props.toggleAriaLabel),

        icon: fromStore(props.icon),
        iconAriaLabel: fromStore(props.iconAriaLabel),
        iconPopoverID: fromStore(props.iconPopoverID),

        text: fromStore(props.text),
        textAriaLabel: fromStore(props.textAriaLabel),

        menuIcon: fromStore(props.menuIcon),
        menuAriaLabel: fromStore(props.menuAriaLabel),

        symlinkIcon: fromStore(props.symlinkIcon),
        symlinkAriaLabel: fromStore(props.symlinkAriaLabel),

        count: fromStore(props.count),
        countAriaLabel: fromStore(props.countAriaLabel),
    } as const;

    /* 属性变更时同步至 store */
    $effect(() => void props.type.set(type));
    $effect(() => void props.name.set(name));
    $effect(() => void props.path.set(path));
    $effect(() => void props.root.set(root));
    $effect(() => void props.depth.set(depth));
    $effect(() => void props.indent.set(indent));
    $effect(() => void props.relative.set(relative));
    $effect(() => void props.directory.set(directory));

    $effect(() => void props.focus.set(focus));
    $effect(() => void props.folded.set(folded));
    $effect(() => void props.symlink.set(symlink));
    $effect(() => void props.dragging.set(dragging));
    $effect(() => void props.draggable.set(draggable));
    $effect(() => void props.hideActions.set(hideActions));

    $effect(() => void props.dragoverTop.set(dragoverTop));
    $effect(() => void props.dragover.set(dragover));
    $effect(() => void props.dragoverBottom.set(dragoverBottom));

    $effect(() => void props.title.set(title));
    $effect(() => void props.children.set(children));

    $effect(() => void props.toggleIcon.set(toggleIcon));
    $effect(() => void props.toggleAriaLabel.set(toggleAriaLabel));

    $effect(() => void props.icon.set(icon));
    $effect(() => void props.iconAriaLabel.set(iconAriaLabel));
    $effect(() => void props.iconPopoverID.set(iconPopoverID));

    $effect(() => void props.text.set(text));
    $effect(() => void props.textAriaLabel.set(textAriaLabel));

    $effect(() => void props.menuIcon.set(menuIcon));
    $effect(() => void props.menuAriaLabel.set(menuAriaLabel));

    $effect(() => void props.symlinkIcon.set(symlinkIcon));
    $effect(() => void props.symlinkAriaLabel.set(symlinkAriaLabel));

    $effect(() => void props.count.set(count));
    $effect(() => void props.countAriaLabel.set(countAriaLabel));

    const tree = getContext<ITree>("tree");
    tree?.appendNode(props);

    onDestroy(() => {
        tree?.removeNode(props);
    });

    /* 构造事件载荷 */
    function details<E extends Event>(e: E) {
        return {
            e,
            li: li!,
            ul: ul!,
            props,
        };
    }

    /* 点击节点 */
    function open(e: MouseEvent) {
        switch (type) {
            case FileTreeNodeType.File: // 文件节点触发打开事件
                onOpen?.(details(e));
                break;
            case FileTreeNodeType.Root:
            case FileTreeNodeType.Folder:
            default: // 其他节点触发折叠/展开事件
                // eslint-disable-next-line ts/no-use-before-define
                toggle(e);
                break;
        }
    }

    /* 点击折叠/展开按钮 */
    function toggle(e: MouseEvent) {
        if (folded) {
            onUnfold?.(details(e));
        }
        else {
            onFold?.(details(e));
        }
    }

    /* 点击菜单按钮/右键菜单 */
    function menu(e: MouseEvent) {
        onMenu?.(details(e));
    }

    /* 拖拽开始 */
    function _onDragstart(e: DragEvent): void {
        onDragstart?.(details(e));
    }

    /* 拖拽结束 */
    function _onDragend(e: DragEvent): void {
        onDragend?.(details(e));
    }

    /* 拖拽进入 */
    function _onDragenter(e: DragEvent): void {
        onDragenter?.(details(e));
    }

    /* 拖拽悬停 */
    function _onDragover(e: DragEvent): void {
        onDragover?.(details(e));
    }

    /* 拖拽离开 */
    function _onDragleave(e: DragEvent): void {
        onDragleave?.(details(e));
    }

    /* 拖拽离放置 */
    function _onDrop(e: DragEvent): void {
        onDrop?.(details(e));
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li
    bind:this={li}
    class="node b3-list-item"
    class:b3-list-item--focus={state.focus.current}
    class:b3-list-item--hide-action={state.hideActions.current}
    class:dragging={state.dragging.current}
    class:dragover={state.dragover.current}
    class:dragover__bottom={state.dragoverBottom.current}
    class:dragover__top={state.dragoverTop.current}
    data-depth={state.depth.current}
    data-directory={state.directory.current}
    data-name={state.name.current}
    data-path={state.path.current}
    data-type={state.type.current}
    draggable={state.draggable.current}
    onclick={stopPropagation(preventDefault(open))}
    oncontextmenu={stopPropagation(preventDefault(menu))}
    ondragend={stopPropagation(_onDragend)}
    ondragenter={stopPropagation(preventDefault(_onDragenter))}
    ondragleave={stopPropagation(preventDefault(_onDragleave))}
    ondragover={stopPropagation(preventDefault(_onDragover))}
    ondragstart={stopPropagation(_onDragstart)}
    ondrop={stopPropagation(preventDefault(_onDrop))}
    title={state.title.current}
>
    <!-- 折叠/展开按钮 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <span
        style:padding-left="calc(4px + {state.indent.current} * {state.depth.current})"
        class="toggle b3-list-item__toggle b3-list-item__toggle--hl"
        class:b3-tooltips={!!state.toggleAriaLabel.current}
        class:b3-tooltips__ne={!!state.toggleAriaLabel.current && state.type.current !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!state.toggleAriaLabel.current && state.type.current === FileTreeNodeType.Root}
        class:fn__hidden={state.type.current === FileTreeNodeType.File}
        aria-label={state.toggleAriaLabel.current}
        onclick={stopPropagation(preventDefault(toggle))}
        role="button"
    >
        <SvgArrow
            icon={state.toggleIcon.current}
            open={!state.folded.current}
        />
    </span>

    <!-- 图标 -->
    <span
        class="icon b3-list-item__icon"
        class:b3-tooltips={!!state.iconAriaLabel.current}
        class:b3-tooltips__ne={!!state.iconAriaLabel.current && state.type.current !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!state.iconAriaLabel.current && state.type.current === FileTreeNodeType.Root}
        aria-label={state.iconAriaLabel.current}
    >
        {#if state.icon.current}
            <!-- svg 图标 -->
            <Icon
                id={state.iconPopoverID.current}
                icon={state.icon.current}
            />
        {:else if state.type.current === FileTreeNodeType.File}
            <!-- 文件图标 -->
            <Svg
                id={state.iconPopoverID.current}
                icon="#iconFile"
            />
        {:else if state.type.current === FileTreeNodeType.Folder}
            <!-- 文件夹图标 -->
            <Svg
                id={state.iconPopoverID.current}
                icon="#iconFolder"
            />
        {:else if state.type.current === FileTreeNodeType.Root}
            <!-- 根目录图标 -->
            <Svg
                id={state.iconPopoverID.current}
                icon="#iconFilesRoot"
            />
        {:else}
            <!-- 未知图标 -->
            <Svg
                id={state.iconPopoverID.current}
                icon="#iconHelp"
            />
        {/if}
    </span>

    <!-- 文本 -->
    <span
        class="text b3-list-item__text"
        class:ariaLabel={!!state.textAriaLabel.current}
        class:b3-tooltips__ne={!!state.textAriaLabel.current && state.type.current !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!state.textAriaLabel.current && state.type.current === FileTreeNodeType.Root}
        aria-label={state.textAriaLabel.current}
    >
        {state.text.current}
    </span>

    <!-- 菜单按钮 -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <span
        class="menu b3-list-item__action"
        class:b3-tooltips={!!state.menuAriaLabel.current}
        class:b3-tooltips__nw={!!state.menuAriaLabel.current && state.type.current !== FileTreeNodeType.Root}
        class:b3-tooltips__sw={!!state.menuAriaLabel.current && state.type.current === FileTreeNodeType.Root}
        data-type="more"
        aria-label={state.menuAriaLabel.current}
        onclick={stopPropagation(preventDefault(menu))}
        role="button"
    >
        {#if state.menuIcon.current}
            <Icon icon={state.menuIcon.current} />
        {/if}
    </span>

    <!-- 符号链接 -->
    {#if state.symlink.current}
        <span
            class="symblink b3-list-item__action"
            class:b3-tooltips={!!state.symlinkAriaLabel.current}
            class:b3-tooltips__nw={!!state.symlinkAriaLabel.current && state.type.current !== FileTreeNodeType.Root}
            class:b3-tooltips__sw={!!state.symlinkAriaLabel.current && state.type.current === FileTreeNodeType.Root}
            data-type="symlink"
            aria-label={state.symlinkAriaLabel.current}
        >
            {#if state.symlinkIcon.current}
                <Icon icon={state.symlinkIcon.current} />
            {/if}
        </span>
    {/if}

    <!-- 计数器 -->
    {#if !Number.isNaN(state.count.current)}
        <span
            class="counter"
            class:b3-tooltips={!!state.countAriaLabel.current}
            class:b3-tooltips__nw={!!state.countAriaLabel.current && state.type.current !== FileTreeNodeType.Root}
            class:b3-tooltips__sw={!!state.countAriaLabel.current && state.type.current === FileTreeNodeType.Root}
            aria-label={state.countAriaLabel.current}
        >
            {state.count.current}
        </span>
    {/if}
</li>

<!-- 下级节点 -->
{#if state.children.current}
    <ul
        bind:this={ul}
        style:--monaco-editor-explorer-indent-left="calc(12px + {state.indent.current} * {state.depth.current})"
        class="node-list"
        class:dragging={state.dragging.current}
        class:dragover={state.dragover.current}
        class:fn__none={state.folded.current}
    >
        <!-- 递归渲染下级节点 (Svelte 5 不再使用 <svelte:self>, 直接引用自身) -->
        {#each state.children.current as node (node.path)}
            <Node
                depth={(state.depth.current ?? 0) + 1}
                {onDrag}
                {onDragend}
                {onDragenter}
                {onDragleave}
                {onDragover}
                {onDragstart}
                {onDrop}
                {onFold}
                {onMenu}
                {onOpen}
                {onUnfold}
                {...node}
            />
        {/each}
    </ul>
{/if}

<style lang="less">
    .dragging {
        // 拖拽中
        opacity: 0.25;
    }
    .node {
        margin: 0; // 辅助线对齐

        // 焦点所在节点
        &.b3-list-item--focus {
            // 有下级目录
            + .node-list {
                // 高亮下级目录
                &::before {
                    // background-color: var(--b3-theme-surface-light);
                    background-color: var(--b3-theme-primary-lighter);
                    // background-color: var(--b3-theme-primary-lightest);
                }
            }
        }
    }

    .node-list {
        position: relative;

        &::before {
            content: "";
            position: absolute;
            left: var(--monaco-editor-explorer-indent-left);
            width: 2px;
            height: 100%;
            background-color: var(--b3-border-color);
            z-index: 1;
        }

        // 焦点在下级节点
        &:has(> .node.b3-list-item--focus) {
            // 高亮本级目录
            &::before {
                // background-color: var(--b3-theme-surface-light);
                background-color: var(--b3-theme-primary-lighter);
                // background-color: var(--b3-theme-primary-lightest);
            }
        }
    }
</style>

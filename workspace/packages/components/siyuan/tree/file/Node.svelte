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
    /* 仅在事件载荷中读取, 无需响应式 */
    // svelte-ignore non_reactive_update
    let ul: HTMLUListElement | undefined; // 下级节点列表元素

    /**
     * 外部响应式变量
     * 这里仅使用属性的初值播种, 后续变更由下方的 `$effect` 同步, 因此无需在闭包中读取属性
     */
    // svelte-ignore state_referenced_locally
    const stores: IFileTreeNodeStores = {
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
    const view = {
        type: fromStore(stores.type),
        name: fromStore(stores.name),
        path: fromStore(stores.path),
        depth: fromStore(stores.depth),
        indent: fromStore(stores.indent),
        directory: fromStore(stores.directory),

        focus: fromStore(stores.focus),
        folded: fromStore(stores.folded),
        symlink: fromStore(stores.symlink),
        dragging: fromStore(stores.dragging),
        draggable: fromStore(stores.draggable),
        hideActions: fromStore(stores.hideActions),

        dragoverTop: fromStore(stores.dragoverTop),
        dragover: fromStore(stores.dragover),
        dragoverBottom: fromStore(stores.dragoverBottom),

        title: fromStore(stores.title),
        children: fromStore(stores.children),

        toggleIcon: fromStore(stores.toggleIcon),
        toggleAriaLabel: fromStore(stores.toggleAriaLabel),

        icon: fromStore(stores.icon),
        iconAriaLabel: fromStore(stores.iconAriaLabel),
        iconPopoverID: fromStore(stores.iconPopoverID),

        text: fromStore(stores.text),
        textAriaLabel: fromStore(stores.textAriaLabel),

        menuIcon: fromStore(stores.menuIcon),
        menuAriaLabel: fromStore(stores.menuAriaLabel),

        symlinkIcon: fromStore(stores.symlinkIcon),
        symlinkAriaLabel: fromStore(stores.symlinkAriaLabel),

        count: fromStore(stores.count),
        countAriaLabel: fromStore(stores.countAriaLabel),
    } as const;

    /* 属性变更时同步至 store */
    $effect(() => void stores.type.set(type));
    $effect(() => void stores.name.set(name));
    $effect(() => void stores.path.set(path));
    $effect(() => void stores.root.set(root));
    $effect(() => void stores.depth.set(depth));
    $effect(() => void stores.indent.set(indent));
    $effect(() => void stores.relative.set(relative));
    $effect(() => void stores.directory.set(directory));

    $effect(() => void stores.focus.set(focus));
    $effect(() => void stores.folded.set(folded));
    $effect(() => void stores.symlink.set(symlink));
    $effect(() => void stores.dragging.set(dragging));
    $effect(() => void stores.draggable.set(draggable));
    $effect(() => void stores.hideActions.set(hideActions));

    $effect(() => void stores.dragoverTop.set(dragoverTop));
    $effect(() => void stores.dragover.set(dragover));
    $effect(() => void stores.dragoverBottom.set(dragoverBottom));

    $effect(() => void stores.title.set(title));
    $effect(() => void stores.children.set(children));

    $effect(() => void stores.toggleIcon.set(toggleIcon));
    $effect(() => void stores.toggleAriaLabel.set(toggleAriaLabel));

    $effect(() => void stores.icon.set(icon));
    $effect(() => void stores.iconAriaLabel.set(iconAriaLabel));
    $effect(() => void stores.iconPopoverID.set(iconPopoverID));

    $effect(() => void stores.text.set(text));
    $effect(() => void stores.textAriaLabel.set(textAriaLabel));

    $effect(() => void stores.menuIcon.set(menuIcon));
    $effect(() => void stores.menuAriaLabel.set(menuAriaLabel));

    $effect(() => void stores.symlinkIcon.set(symlinkIcon));
    $effect(() => void stores.symlinkAriaLabel.set(symlinkAriaLabel));

    $effect(() => void stores.count.set(count));
    $effect(() => void stores.countAriaLabel.set(countAriaLabel));

    const tree = getContext<ITree>("tree");
    tree?.appendNode(stores);

    onDestroy(() => {
        tree?.removeNode(stores);
    });

    /* 构造事件载荷 */
    function details<E extends Event>(e: E) {
        return {
            e,
            li: li!,
            ul: ul!,
            props: stores,
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
    class:b3-list-item--focus={view.focus.current}
    class:b3-list-item--hide-action={view.hideActions.current}
    class:dragging={view.dragging.current}
    class:dragover={view.dragover.current}
    class:dragover__bottom={view.dragoverBottom.current}
    class:dragover__top={view.dragoverTop.current}
    data-depth={view.depth.current}
    data-directory={view.directory.current}
    data-name={view.name.current}
    data-path={view.path.current}
    data-type={view.type.current}
    draggable={view.draggable.current}
    onclick={stopPropagation(preventDefault(open))}
    oncontextmenu={stopPropagation(preventDefault(menu))}
    ondragend={stopPropagation(_onDragend)}
    ondragenter={stopPropagation(preventDefault(_onDragenter))}
    ondragleave={stopPropagation(preventDefault(_onDragleave))}
    ondragover={stopPropagation(preventDefault(_onDragover))}
    ondragstart={stopPropagation(_onDragstart)}
    ondrop={stopPropagation(preventDefault(_onDrop))}
    title={view.title.current}
>
    <!-- 折叠/展开按钮 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <span
        style:padding-left="calc(4px + {view.indent.current} * {view.depth.current})"
        class="toggle b3-list-item__toggle b3-list-item__toggle--hl"
        class:b3-tooltips={!!view.toggleAriaLabel.current}
        class:b3-tooltips__ne={!!view.toggleAriaLabel.current && view.type.current !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!view.toggleAriaLabel.current && view.type.current === FileTreeNodeType.Root}
        class:fn__hidden={view.type.current === FileTreeNodeType.File}
        aria-label={view.toggleAriaLabel.current}
        onclick={stopPropagation(preventDefault(toggle))}
        role="button"
    >
        <SvgArrow
            icon={view.toggleIcon.current}
            open={!view.folded.current}
        />
    </span>

    <!-- 图标 -->
    <span
        class="icon b3-list-item__icon"
        class:b3-tooltips={!!view.iconAriaLabel.current}
        class:b3-tooltips__ne={!!view.iconAriaLabel.current && view.type.current !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!view.iconAriaLabel.current && view.type.current === FileTreeNodeType.Root}
        aria-label={view.iconAriaLabel.current}
    >
        {#if view.icon.current}
            <!-- svg 图标 -->
            <Icon
                id={view.iconPopoverID.current}
                icon={view.icon.current}
            />
        {:else if view.type.current === FileTreeNodeType.File}
            <!-- 文件图标 -->
            <Svg
                id={view.iconPopoverID.current}
                icon="#iconFile"
            />
        {:else if view.type.current === FileTreeNodeType.Folder}
            <!-- 文件夹图标 -->
            <Svg
                id={view.iconPopoverID.current}
                icon="#iconFolder"
            />
        {:else if view.type.current === FileTreeNodeType.Root}
            <!-- 根目录图标 -->
            <Svg
                id={view.iconPopoverID.current}
                icon="#iconFilesRoot"
            />
        {:else}
            <!-- 未知图标 -->
            <Svg
                id={view.iconPopoverID.current}
                icon="#iconHelp"
            />
        {/if}
    </span>

    <!-- 文本 -->
    <span
        class="text b3-list-item__text"
        class:ariaLabel={!!view.textAriaLabel.current}
        class:b3-tooltips__ne={!!view.textAriaLabel.current && view.type.current !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!view.textAriaLabel.current && view.type.current === FileTreeNodeType.Root}
        aria-label={view.textAriaLabel.current}
    >
        {view.text.current}
    </span>

    <!-- 菜单按钮 -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <span
        class="menu b3-list-item__action"
        class:b3-tooltips={!!view.menuAriaLabel.current}
        class:b3-tooltips__nw={!!view.menuAriaLabel.current && view.type.current !== FileTreeNodeType.Root}
        class:b3-tooltips__sw={!!view.menuAriaLabel.current && view.type.current === FileTreeNodeType.Root}
        data-type="more"
        aria-label={view.menuAriaLabel.current}
        onclick={stopPropagation(preventDefault(menu))}
        role="button"
    >
        {#if view.menuIcon.current}
            <Icon icon={view.menuIcon.current} />
        {/if}
    </span>

    <!-- 符号链接 -->
    {#if view.symlink.current}
        <span
            class="symblink b3-list-item__action"
            class:b3-tooltips={!!view.symlinkAriaLabel.current}
            class:b3-tooltips__nw={!!view.symlinkAriaLabel.current && view.type.current !== FileTreeNodeType.Root}
            class:b3-tooltips__sw={!!view.symlinkAriaLabel.current && view.type.current === FileTreeNodeType.Root}
            data-type="symlink"
            aria-label={view.symlinkAriaLabel.current}
        >
            {#if view.symlinkIcon.current}
                <Icon icon={view.symlinkIcon.current} />
            {/if}
        </span>
    {/if}

    <!-- 计数器 -->
    {#if !Number.isNaN(view.count.current)}
        <span
            class="counter"
            class:b3-tooltips={!!view.countAriaLabel.current}
            class:b3-tooltips__nw={!!view.countAriaLabel.current && view.type.current !== FileTreeNodeType.Root}
            class:b3-tooltips__sw={!!view.countAriaLabel.current && view.type.current === FileTreeNodeType.Root}
            aria-label={view.countAriaLabel.current}
        >
            {view.count.current}
        </span>
    {/if}
</li>

<!-- 下级节点 -->
{#if view.children.current}
    <ul
        bind:this={ul}
        style:--monaco-editor-explorer-indent-left="calc(12px + {view.indent.current} * {view.depth.current})"
        class="node-list"
        class:dragging={view.dragging.current}
        class:dragover={view.dragover.current}
        class:fn__none={view.folded.current}
    >
        <!-- 递归渲染下级节点 (Svelte 5 不再使用 <svelte:self>, 直接引用自身) -->
        {#each view.children.current as node (node.path)}
            <Node
                depth={(view.depth.current ?? 0) + 1}
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

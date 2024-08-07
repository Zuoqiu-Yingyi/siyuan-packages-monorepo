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

<script lang="ts">
    import {
        createEventDispatcher,
        getContext,
        onDestroy,
    } from "svelte";
    import {
        writable,
        type Unsubscriber,
    } from "svelte/store";

    import {
        FileTreeNodeType,
        type IFileTreeEvent,
        type IFileTreeNode,
        type IFileTreeNodeStores,
        type ITree,
    } from ".";
    import Icon from "./../../misc/Icon.svelte";
    import Svg from "./../../misc/Svg.svelte";
    import SvgArrow from "./../../misc/SvgArrow.svelte";

    export let type: IFileTreeNode["type"];
    export let name: IFileTreeNode["name"] = "";
    export let path: IFileTreeNode["path"];
    export let root: IFileTreeNode["root"] = "";
    export let depth: IFileTreeNode["depth"] = 0;
    export let indent: IFileTreeNode["indent"] = "1em";
    export let relative: IFileTreeNode["relative"] = "";
    export let directory: IFileTreeNode["directory"];

    export let focus: IFileTreeNode["focus"] = false;
    export let folded: IFileTreeNode["folded"] = true;
    export let symlink: IFileTreeNode["symlink"] = false;
    export let dragging: IFileTreeNode["dragging"] = false;
    export let draggable: IFileTreeNode["draggable"] = false;
    export let hideActions: IFileTreeNode["hideActions"] = true;

    export let dragoverTop: IFileTreeNode["dragoverTop"] = false;
    export let dragover: IFileTreeNode["dragover"] = false;
    export let dragoverBottom: IFileTreeNode["dragoverBottom"] = false;

    export let title: IFileTreeNode["title"] = "";
    // eslint-disable-next-line no-undef-init
    export let children: IFileTreeNode["children"] = undefined;

    export let toggleIcon: IFileTreeNode["toggleIcon"] = "#iconRight";
    export let toggleAriaLabel: IFileTreeNode["toggleAriaLabel"] = "";

    export let icon: IFileTreeNode["icon"] = "";
    export let iconAriaLabel: IFileTreeNode["iconAriaLabel"] = "";
    export let iconPopoverID: IFileTreeNode["iconPopoverID"] = "";

    export let text: IFileTreeNode["text"] = "";
    export let textAriaLabel: IFileTreeNode["textAriaLabel"] = "";

    export let menuIcon: IFileTreeNode["menuIcon"] = "#iconMore";
    export let menuAriaLabel: IFileTreeNode["menuAriaLabel"] = "";

    export let symlinkIcon: IFileTreeNode["symlinkIcon"] = "#iconLink";
    export let symlinkAriaLabel: IFileTreeNode["symlinkAriaLabel"] = "";

    export let count: IFileTreeNode["count"] = Number.NaN;
    export let countAriaLabel: IFileTreeNode["countAriaLabel"] = "";

    let li: HTMLLIElement; // 当前节点元素
    let ul: HTMLUListElement; // 下级节点列表元素

    const dispatcher = createEventDispatcher<IFileTreeEvent>();

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

    $: props.type.set(type);
    $: props.name.set(name);
    $: props.path.set(path);
    $: props.root.set(root);
    $: props.depth.set(depth);
    $: props.indent.set(indent);
    $: props.relative.set(relative);
    $: props.directory.set(directory);

    $: props.focus.set(focus);
    $: props.folded.set(folded);
    $: props.symlink.set(symlink);
    $: props.dragging.set(dragging);
    $: props.draggable.set(draggable);
    $: props.hideActions.set(hideActions);

    $: props.dragoverTop.set(dragoverTop);
    $: props.dragover.set(dragover);
    $: props.dragoverBottom.set(dragoverBottom);

    $: props.title.set(title);
    $: props.children.set(children);

    $: props.toggleIcon.set(toggleIcon);
    $: props.toggleAriaLabel.set(toggleAriaLabel);

    $: props.icon.set(icon);
    $: props.iconAriaLabel.set(iconAriaLabel);
    $: props.iconPopoverID.set(iconPopoverID);

    $: props.text.set(text);
    $: props.textAriaLabel.set(textAriaLabel);

    $: props.menuIcon.set(menuIcon);
    $: props.menuAriaLabel.set(menuAriaLabel);

    $: props.symlinkIcon.set(symlinkIcon);
    $: props.symlinkAriaLabel.set(symlinkAriaLabel);

    $: props.count.set(count);
    $: props.countAriaLabel.set(countAriaLabel);

    const unsubscribes: Unsubscriber[] = [
        props.type.subscribe((v) => (type = v)), //
        props.name.subscribe((v) => (name = v)), //
        props.path.subscribe((v) => (path = v)), //
        props.root.subscribe((v) => (root = v)), //
        props.indent.subscribe((v) => (indent = v)), //
        props.depth.subscribe((v) => (depth = v)), //
        props.relative.subscribe((v) => (relative = v)), //
        props.directory.subscribe((v) => (directory = v)), //

        props.focus.subscribe((v) => (focus = v)), //
        props.folded.subscribe((v) => (folded = v)), //
        props.symlink.subscribe((v) => (symlink = v)), //
        props.dragging.subscribe((v) => (dragging = v)), //
        props.draggable.subscribe((v) => (draggable = v)), //
        props.hideActions.subscribe((v) => (hideActions = v)), //

        props.dragoverTop.subscribe((v) => (dragoverTop = v)), //
        props.dragover.subscribe((v) => (dragover = v)), //
        props.dragoverBottom.subscribe((v) => (dragoverBottom = v)), //

        props.title.subscribe((v) => (title = v)), //
        props.children.subscribe((v) => (children = v)), //

        props.toggleIcon.subscribe((v) => (toggleIcon = v)), //
        props.toggleAriaLabel.subscribe((v) => (toggleAriaLabel = v)), //

        props.icon.subscribe((v) => (icon = v)), //
        props.iconAriaLabel.subscribe((v) => (iconAriaLabel = v)), //
        props.iconPopoverID.subscribe((v) => (iconPopoverID = v)), //

        props.text.subscribe((v) => (text = v)), //
        props.textAriaLabel.subscribe((v) => (textAriaLabel = v)), //

        props.menuIcon.subscribe((v) => (menuIcon = v)), //
        props.menuAriaLabel.subscribe((v) => (menuAriaLabel = v)), //

        props.symlinkIcon.subscribe((v) => (symlinkIcon = v)), //
        props.symlinkAriaLabel.subscribe((v) => (symlinkAriaLabel = v)), //

        props.count.subscribe((v) => (count = v)), //
        props.countAriaLabel.subscribe((v) => (countAriaLabel = v)), //
    ];

    const tree = getContext<ITree>("tree");
    tree?.appendNode(props);

    onDestroy(() => {
        tree?.removeNode(props);
        unsubscribes.forEach((unsubscribe) => unsubscribe());
    });

    /* 点击节点 */
    function open(e: MouseEvent) {
        switch (type) {
            case FileTreeNodeType.File: // 文件节点派发打开事件
                dispatcher("open", {
                    e,
                    li,
                    ul,
                    props,
                    dispatcher,
                });
                break;
            case FileTreeNodeType.Root:
            case FileTreeNodeType.Folder:
            default: // 其他节点派发折叠/展开事件
                // eslint-disable-next-line ts/no-use-before-define
                toggle(e);
                break;
        }
    }

    /* 点击折叠/展开按钮 */
    function toggle(e: MouseEvent) {
        if (folded) {
            dispatcher("unfold", {
                e,
                li,
                ul,
                props,
                dispatcher,
            });
        }
        else {
            dispatcher("fold", {
                e,
                li,
                ul,
                props,
                dispatcher,
            });
        }
    }

    /* 点击菜单按钮/右键菜单 */
    function menu(e: MouseEvent) {
        dispatcher("menu", {
            e,
            li,
            ul,
            props,
            dispatcher,
        });
    }

    /* 拖拽开始 */
    function ondragstart(e: DragEvent): void {
        dispatcher("dragstart", {
            e,
            li,
            ul,
            props,
            dispatcher,
        });
    }

    /* 拖拽结束 */
    function ondragend(e: DragEvent): void {
        dispatcher("dragend", {
            e,
            li,
            ul,
            props,
            dispatcher,
        });
    }

    /* 拖拽进入 */
    function ondragenter(e: DragEvent): void {
        dispatcher("dragenter", {
            e,
            li,
            ul,
            props,
            dispatcher,
        });
    }

    /* 拖拽悬停 */
    function ondragover(e: DragEvent): void {
        dispatcher("dragover", {
            e,
            li,
            ul,
            props,
            dispatcher,
        });
    }

    /* 拖拽离开 */
    function ondragleave(e: DragEvent): void {
        dispatcher("dragleave", {
            e,
            li,
            ul,
            props,
            dispatcher,
        });
    }

    /* 拖拽离放置 */
    function ondrop(e: DragEvent): void {
        dispatcher("drop", {
            e,
            li,
            ul,
            props,
            dispatcher,
        });
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li
    bind:this={li}
    class="node b3-list-item"
    class:b3-list-item--focus={focus}
    class:b3-list-item--hide-action={hideActions}
    class:dragging
    class:dragover
    class:dragover__bottom={dragoverBottom}
    class:dragover__top={dragoverTop}
    data-depth={depth}
    data-directory={directory}
    data-name={name}
    data-path={path}
    data-type={type}
    {draggable}
    {title}
    on:dragstart|stopPropagation={ondragstart}
    on:dragend|stopPropagation={ondragend}
    on:dragenter|stopPropagation|preventDefault={ondragenter}
    on:dragover|stopPropagation|preventDefault={ondragover}
    on:dragleave|stopPropagation|preventDefault={ondragleave}
    on:drop|stopPropagation|preventDefault={ondrop}
    on:click|stopPropagation|preventDefault={open}
    on:contextmenu|stopPropagation|preventDefault={menu}
>
    <!-- 折叠/展开按钮 -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-interactive-supports-focus -->
    <span
        style:padding-left="calc(4px + {indent} * {depth})"
        class="toggle b3-list-item__toggle b3-list-item__toggle--hl"
        class:b3-tooltips={!!toggleAriaLabel}
        class:b3-tooltips__ne={!!toggleAriaLabel && type !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!toggleAriaLabel && type === FileTreeNodeType.Root}
        class:fn__hidden={type === FileTreeNodeType.File}
        aria-label={toggleAriaLabel}
        role="button"
        on:click|stopPropagation|preventDefault={toggle}
    >
        <SvgArrow
            icon={toggleIcon}
            open={!folded}
        />
    </span>

    <!-- 图标 -->
    <span
        class="icon b3-list-item__icon"
        class:b3-tooltips={!!iconAriaLabel}
        class:b3-tooltips__ne={!!iconAriaLabel && type !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!iconAriaLabel && type === FileTreeNodeType.Root}
        aria-label={iconAriaLabel}
    >
        {#if icon}
            <!-- svg 图标 -->
            <Icon
                id={iconPopoverID}
                {icon}
            />
        {:else if type === FileTreeNodeType.File}
            <!-- 文件图标 -->
            <Svg
                id={iconPopoverID}
                icon="#iconFile"
            />
        {:else if type === FileTreeNodeType.Folder}
            <!-- 文件夹图标 -->
            <Svg
                id={iconPopoverID}
                icon="#iconFolder"
            />
        {:else if type === FileTreeNodeType.Root}
            <!-- 根目录图标 -->
            <Svg
                id={iconPopoverID}
                icon="#iconFilesRoot"
            />
        {:else}
            <!-- 未知图标 -->
            <Svg
                id={iconPopoverID}
                icon="#iconHelp"
            />
        {/if}
    </span>

    <!-- 文本 -->
    <span
        class="text b3-list-item__text"
        class:ariaLabel={!!textAriaLabel}
        class:b3-tooltips__ne={!!textAriaLabel && type !== FileTreeNodeType.Root}
        class:b3-tooltips__se={!!textAriaLabel && type === FileTreeNodeType.Root}
        aria-label={textAriaLabel}
    >
        {text}
    </span>

    <!-- 菜单按钮 -->
    <!-- svelte-ignore a11y-interactive-supports-focus -->
    <span
        class="menu b3-list-item__action"
        class:b3-tooltips={!!menuAriaLabel}
        class:b3-tooltips__nw={!!menuAriaLabel && type !== FileTreeNodeType.Root}
        class:b3-tooltips__sw={!!menuAriaLabel && type === FileTreeNodeType.Root}
        data-type="more"
        aria-label={menuAriaLabel}
        role="button"
        on:click|stopPropagation|preventDefault={menu}
    >
        {#if menuIcon}
            <Icon icon={menuIcon} />
        {/if}
    </span>

    <!-- 符号链接 -->
    {#if symlink}
        <span
            class="symblink b3-list-item__action"
            class:b3-tooltips={!!symlinkAriaLabel}
            class:b3-tooltips__nw={!!symlinkAriaLabel && type !== FileTreeNodeType.Root}
            class:b3-tooltips__sw={!!symlinkAriaLabel && type === FileTreeNodeType.Root}
            data-type="symlink"
            aria-label={symlinkAriaLabel}
        >
            {#if symlinkIcon}
                <Icon icon={symlinkIcon} />
            {/if}
        </span>
    {/if}

    <!-- 计数器 -->
    {#if !Number.isNaN(count)}
        <span
            class="counter"
            class:b3-tooltips={!!countAriaLabel}
            class:b3-tooltips__nw={!!countAriaLabel && type !== FileTreeNodeType.Root}
            class:b3-tooltips__sw={!!countAriaLabel && type === FileTreeNodeType.Root}
            aria-label={countAriaLabel}
        >
            {count}
        </span>
    {/if}
</li>

<!-- 下级节点 -->
{#if children}
    <ul
        bind:this={ul}
        style:--monaco-editor-explorer-indent-left="calc(12px + {indent} * {depth})"
        class="node-list"
        class:dragging
        class:dragover
        class:fn__none={folded}
    >
        {#each children as node (node.path)}
            <svelte:self
                depth={(depth ?? 0) + 1}
                on:open
                on:fold
                on:menu
                on:unfold
                on:dragstart
                on:dragend
                on:dragenter
                on:dragover
                on:dragleave
                on:drop
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
    .highlight(@color: var(--b3-theme-primary-lighter)) {
        // 辅助线高亮
        &::before {
            // background-color: var(--b3-theme-surface-light);
            background-color: @color;
            // background-color: var(--b3-theme-primary-lightest);
        }
    }
    .node {
        margin: 0; // 辅助线对齐

        // 焦点所在节点
        &.b3-list-item--focus {
            // 有下级目录
            + .node-list {
                // 高亮下级目录
                .highlight();
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
            .highlight(); // 高亮本级目录
        }
    }
</style>

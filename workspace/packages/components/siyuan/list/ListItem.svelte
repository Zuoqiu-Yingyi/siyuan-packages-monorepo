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
    import type { IListItem } from "./list";

    export interface IProps {
        text: IListItem["text"]; // 文本

        icon?: NonNullable<IListItem["icon"]>; // 图标
        src?: NonNullable<IListItem["src"]>; // 图片
        meta?: NonNullable<IListItem["meta"]>; // 元信息
        style?: NonNullable<IListItem["style"]>; // 文本样式

        narrow?: NonNullable<IListItem["narrow"]>; // 是否为紧凑布局
        border?: NonNullable<IListItem["border"]>; // 是否显示下级列表边框

        fold?: NonNullable<IListItem["fold"]>; // 是否折叠下级列表
        children?: NonNullable<IListItem["children"]>; // 下级列表
        indent?: NonNullable<IListItem["indent"]>; // 下级列表缩进
    }

    export type TProps = IProps;
</script>

<script lang="ts">
    import Svg from "./../misc/Svg.svelte";
    import SvgArrow from "./../misc/SvgArrow.svelte";
    import List from "./List.svelte";

    let {
        text,

        icon = "",
        src = "",
        meta = "",
        style = "",

        narrow = false,
        border = false,

        fold = $bindable(true),
        children = [],
        indent = "",
    }: TProps = $props();

    function onToggle() {
        fold = !fold;
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li
    class="b3-list-item"
    class:b3-list-item--narrow={narrow}
    class:toggle={children.length > 0}
    onclick={onToggle}
>
    <!-- 下级列表折叠按钮 -->
    <span
        class="b3-list-item__toggle"
        class:fn__none={narrow}
        class:hidden={children.length === 0}
    >
        <SvgArrow open={!fold} />
    </span>

    <!-- 图标 -->
    {#if icon.startsWith("#")}
        <Svg
            className="b3-list-item__graphic"
            {icon}
        />
    {:else if icon}
        <span class="b3-list-item__graphic">{icon}</span>
    {:else if src}
        <img
            class="b3-list-item__graphic"
            alt="icon"
            {src}
        />
    {/if}

    <!-- 文本 -->
    <span
        {style}
        class="b3-list-item__text"
    >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html text}
    </span>

    <!-- 元信息 -->
    {#if meta}
        <span class="b3-list-item__meta">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html meta}
        </span>
    {/if}
</li>

<!-- 下级列表 -->
{#if children.length > 0}
    <List
        {border}
        flex_1={false}
        fn__none={fold}
        {indent}
        items={children}
    />
{/if}

<style lang="less">
    .b3-list-item {
        cursor: default;

        .b3-list-item__toggle {
            cursor: pointer;

            &.hidden {
                visibility: hidden;
            }
        }
    }
</style>

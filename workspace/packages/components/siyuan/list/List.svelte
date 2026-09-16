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
        items?: IListItem[]; // 列表项
        className?: string; // 类名
        border?: boolean; // 是否显示边框
        fn__none?: boolean; // 是否隐藏 .fn__none (display: none)
        flex_1?: boolean; // 是否填充剩余空间 .fn__flex-1
        width?: number; // 宽度 (px, 0 表示不限制)
        indent?: string; // 左侧缩进
    }

    export type TProps = IProps;
</script>

<script lang="ts">
    import ListItem from "./ListItem.svelte";

    const {
        items = [],
        className = "b3-list b3-list--background",
        border = false,
        fn__none = false,
        flex_1 = true,
        width = 0,
        indent = "",
    }: TProps = $props();
</script>

<ul
    style:margin-left={indent}
    style:width={width > 0 ? `${width}px` : undefined}
    class={className}
    class:b3-list--border={border}
    class:fn__flex-1={flex_1}
    class:fn__none
>
    {#each items as item, i (i)}
        <ListItem {...item} />
    {/each}
</ul>

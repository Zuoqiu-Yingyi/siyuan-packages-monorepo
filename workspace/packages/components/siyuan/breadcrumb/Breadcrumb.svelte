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
    import type { Snippet } from "svelte";

    import type { IBlockIconProps } from "./../misc";

    import type { IProps as IBarProps } from "./Bar.svelte";

    export interface IProps {
        items?: IBarProps["items"]; // 面包屑元素列表
        icons?: IBlockIconProps[]; // 按钮列表
    }

    export interface ISlots {
        bar?: Snippet; // 自定义面包屑导航栏 (代替 items)
        iconList?: Snippet; // 自定义按钮列表 (代替 icons)
    }

    export type TProps = IProps & ISlots;
</script>

<script lang="ts">
    import BlockIcon from "./../misc/BlockIcon.svelte";
    import Bar from "./Bar.svelte";

    const {
        items = [],
        icons = [],

        bar,
        iconList,
    }: TProps = $props();
</script>

<div class="protyle-breadcrumb">
    {#if bar}
        {@render bar()}
    {:else}
        <Bar {items} />
    {/if}
    {#if iconList}
        {@render iconList()}
    {:else}
        {#each icons as icon, i (i)}
            {#if i === 0}
                <span class="protyle-breadcrumb__space"></span>
            {:else}
                <span class="fn__space"></span>
            {/if}
            <BlockIcon {...icon} />
        {/each}
    {/if}
</div>

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

    import type { IBreadcrumbElement } from ".";

    export interface IProps {
        items?: IBreadcrumbElement[]; // 面包屑元素列表
    }

    export interface ISlots {
        children?: Snippet; // 自定义面包屑内容
    }

    export type TProps = IProps & ISlots;
</script>

<script lang="ts">
    import Svg from "./../misc/Svg.svelte";
    import Item from "./Item.svelte";

    const {
        items = [],
        children,
    }: TProps = $props();
</script>

<div class="protyle-breadcrumb__bar protyle-breadcrumb__bar--nowrap">
    {#if children}
        {@render children()}
    {:else}
        {#each items as item, i (i)}
            {#if item.type === "item"}
                <Item {...item} />
            {:else if item.type === "arrow"}
                <Svg
                    className="protyle-breadcrumb__arrow"
                    icon={item.icon || "#iconRight"}
                />
            {/if}
        {/each}
    {/if}
</div>

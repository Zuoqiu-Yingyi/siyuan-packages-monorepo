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

    import type { IBar } from ".";
    import type { IBlockIconProps } from "./../misc";

    export interface IProps {
        logo?: NonNullable<IBar["logo"]>; // 图标
        title?: NonNullable<IBar["title"]>; // 标题
        icons?: NonNullable<IBar["icons"]>; // 图标按钮
    }

    export interface ISlots {
        logoSlot?: Snippet; // 自定义图标与标题
        icon?: Snippet<[IBlockIconProps]>; // 自定义单个图标按钮
    }

    export type TProps = IProps & ISlots;
</script>

<script lang="ts">
    import BlockIcon from "./../misc/BlockIcon.svelte";
    import Logo from "./Logo.svelte";

    const {
        logo = "",
        title = "",

        icons = [],

        logoSlot,
        icon: iconSlot,
    }: TProps = $props();
</script>

<div class="block__icons">
    {#if logoSlot}
        {@render logoSlot()}
    {:else if logo || title}
        <Logo
            icon={logo}
            {title}
        />
    {/if}
    <!-- REF: https://svelte.dev/docs/svelte/snippet#Passing-snippets-to-components -->
    {#each icons as icon, i (i)}
        <span
            class="fn__space"
            class:fn__flex-1={i === 0}
        ></span>

        {#if iconSlot}
            {@render iconSlot(icon)}
        {:else}
            <BlockIcon {...icon} />
        {/if}
    {/each}
</div>

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
    import BlockIcon from "./../misc/BlockIcon.svelte";
    import Logo from "./Logo.svelte";

    import type { IBar } from ".";

    export let logo: NonNullable<IBar["logo"]> = ""; // 图标
    export let title: NonNullable<IBar["title"]> = ""; // 标题

    export let icons: NonNullable<IBar["icons"]> = []; // 图标按钮
</script>

<div class="block__icons">
    <slot name="logo">
        {#if logo || title}
            <Logo
                icon={logo}
                {title}
            />
        {/if}
    </slot>
    <!-- REF: https://www.svelte.cn/docs#slot_let -->
    {#each icons as icon, i (i)}
        <span
            class="fn__space"
            class:fn__flex-1={i === 0}
        />

        <slot
            name="icon"
            {icon}
        >
            <BlockIcon {...icon} />
        </slot>
    {/each}
</div>

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

<!-- 选项卡组 -->

<script lang="ts">
    import Svg from "./../../misc/Svg.svelte";
    import { type ITab } from "./../tab";
    import Tab from "./Tab.svelte";

    import type { ComponentEvents } from "svelte";

    export let tabs: ITab[];
    export let focus: number | string;

    function changed(e: ComponentEvents<Tab>["changed"]) {
        focus = e.detail.key;
    }
</script>

<div
    style="height: 100%"
    class="fn__flex-column"
>
    <!-- 选项卡页签栏 -->
    <div class="layout-tab-bar fn__flex">
        {#each tabs as tab (tab.key)}
            <!-- [事件 / 事件转发 • Svelte 教程 | Svelte 中文网](https://www.svelte.cn/tutorial/event-forwarding) -->
            <Tab
                name={tab.name}
                focus={tab.key === focus}
                icon={!!tab.icon}
                key={tab.key}
                on:changed={changed}
            >
                <span slot="icon">
                    {#if tab.icon?.startsWith("#")}
                        <Svg icon={tab.icon} />
                    {:else if tab.icon}
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html tab.icon}
                    {/if}
                </span>
                <span slot="text">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html tab.text}
                </span>
            </Tab>
        {/each}
    </div>

    <!-- 选项卡内容栏 -->
    <!-- [Svelte API 中文文档 | Svelte 中文网](https://www.svelte.cn/docs#slot_let) -->
    <div class="fn__flex-1">
        <slot {focus}>Container</slot>
    </div>
</div>

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

<script
    lang="ts"
    module
>
    import type { Snippet } from "svelte";

    import type { ITabEvent } from "./../event";
    import type { ITab, TabKey } from "./../tab";

    export interface IProps {
        tabs: ITab[]; // 页签列表
        focus: TabKey; // 当前选中的页签的 key
    }

    export interface ISlots {
        children?: Snippet<[TabKey]>; // 页签内容 (参数为当前选中的页签的 key)
    }

    export type TProps = IProps & ISlots;
</script>

<script lang="ts">
    import Svg from "./../../misc/Svg.svelte";
    import Tab from "./Tab.svelte";

    let {
        tabs,
        focus = $bindable(),

        children,
    }: TProps = $props();

    function changed(params: ITabEvent["changed"]) {
        focus = params.key;
    }
</script>

<div
    style="height: 100%"
    class="fn__flex-column"
>
    <!-- 选项卡页签栏 -->
    <div class="layout-tab-bar fn__flex">
        {#each tabs as tab (tab.key)}
            <Tab
                name={tab.name}
                focus={tab.key === focus}
                icon={!!tab.icon}
                key={tab.key}
                onChanged={changed}
            >
                {#snippet iconSlot()}
                    <span>
                        {#if tab.icon?.startsWith("#")}
                            <Svg icon={tab.icon} />
                        {:else if tab.icon}
                            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                            {@html tab.icon}
                        {/if}
                    </span>
                {/snippet}
                {#snippet text()}
                    <span>
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html tab.text}
                    </span>
                {/snippet}
            </Tab>
        {/each}
    </div>

    <!-- 选项卡内容栏 -->
    <!-- REF: https://svelte.dev/docs/svelte/snippet#Passing-snippets-to-components -->
    <div class="fn__flex-1">
        {#if children}
            {@render children(focus)}
        {:else}
            Container
        {/if}
    </div>
</div>

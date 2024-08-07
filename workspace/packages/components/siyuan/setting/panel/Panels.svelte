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

<!-- 面板组 -->

<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import Svg from "./../../misc/Svg.svelte";

    import type { IPanelsEvent } from "./../event";
    import type { ITab, TabKey } from "./../tab";

    export let panels: ITab[]; // 面板标签列表
    export let focus: TabKey; // 当前选中的面板的 key

    export let searchEnable = false; // 是否启用搜索
    export let searchPlaceholder = ""; // 搜索提示内容
    export let searchValue = ""; // 搜索框内容

    const dispatch = createEventDispatcher<IPanelsEvent>();

    function searchChanged() {
        dispatch("search-changed", { value: searchValue });
    }

    function changed(key: TabKey) {
        dispatch("changed", { key });
        focus = key;
    }
</script>

<div class="fn__flex-1 fn__flex config__panel">
    <!-- 面板标签列表 -->
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#if searchEnable}
            <!-- 搜索框 -->
            <div class="b3-form__icon">
                <Svg
                    className="b3-form__icon-icon"
                    icon="#iconSearch"
                />
                <input
                    class="b3-text-field fn__block b3-form__icon-input"
                    placeholder={searchPlaceholder}
                    bind:value={searchValue}
                    on:change={searchChanged}
                />
            </div>
        {/if}

        {#each panels as panel (panel.key)}
            <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
            <li
                class="b3-list-item"
                class:b3-list-item--focus={panel.key === focus}
                data-name={panel.name}
                role="button"
                on:click={() => changed(panel.key)}
                on:keyup={() => changed(panel.key)}
            >
                {#if panel.icon}
                    <Svg
                        className="b3-list-item__graphic"
                        icon={panel.icon}
                    />
                {/if}
                <span class="b3-list-item__text">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html panel.text}
                </span>
            </li>
        {/each}
    </ul>

    <!-- 面板主体 -->
    <div class="config__tab-wrap">
        <slot {focus}>Container</slot>
    </div>
</div>

<style lang="less">
    .b3-list-item__text {
        margin-right: 0.5em;
    }
</style>

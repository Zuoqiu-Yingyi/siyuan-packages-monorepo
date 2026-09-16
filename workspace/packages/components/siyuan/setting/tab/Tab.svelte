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

<!-- 标签页页签 -->
<script
    lang="ts"
    module
>
    import type { Snippet } from "svelte";

    import type { ITabEvent } from "./../event";
    import type { TabKey } from "./../tab";

    export interface IProps {
        key: TabKey; // 该页签的唯一标识
        icon: boolean; // 是否显示图标
        name?: string; // 该页签的名称
        focus?: boolean; // 该页签是否聚焦
    }

    export interface IHandlers {
        onChanged?: (params: ITabEvent["changed"]) => void; // 页签切换
    }

    export interface ISlots {
        iconSlot?: Snippet; // 页签图标
        text?: Snippet; // 页签文本
    }

    export type TProps = IProps & IHandlers & ISlots;
</script>

<script lang="ts">
    const {
        key,
        icon,
        name = "",
        focus = false,

        onChanged,

        iconSlot,
        text,
    }: TProps = $props();

    function changed() {
        if (!focus) {
            onChanged?.({ key });
        }
    }
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class="item item--full"
    class:item--focus={focus}
    data-type={name}
    onclick={changed}
    role="button"
>
    <!-- 通过判断 snippet 属性是否存在来检测是否传入了内容 -->
    <!-- REF: https://svelte.dev/docs/svelte/snippet -->
    <span class="fn__flex-1"></span>
    {#if icon && iconSlot}
        <span class="item__icon">
            {@render iconSlot()}
        </span>
    {/if}

    <span class="item__text">
        {#if text}
            {@render text()}
        {:else}
            text
        {/if}
    </span>

    <span class="fn__flex-1"></span>
</div>

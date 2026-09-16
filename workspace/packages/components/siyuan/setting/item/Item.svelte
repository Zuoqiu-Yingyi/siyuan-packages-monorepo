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

<!--
    常规设置项(行级)/大型设置项(块级)
    REF: https://github.com/siyuan-note/plugin-sample-vite-svelte/blob/main/src/libs/setting-item.svelte
-->

<script
    lang="ts"
    module
>
    import type { Snippet } from "svelte";

    export interface IProps {
        title?: string; // Displaying Setting Title
        text?: string; // Displaying Setting Text
        block?: boolean; // Using Block Style
    }

    export interface ISlots {
        titleSlot?: Snippet; // 自定义标题 (代替 title)
        textSlot?: Snippet; // 自定义说明文本 (代替 text)
        input?: Snippet; // 设置项控件
    }

    export type TProps = IProps & ISlots;
</script>

<script lang="ts">
    const {
        title = "",
        text = "",
        block = false,

        titleSlot,
        textSlot,
        input,
    }: TProps = $props();
</script>

<label class="fn__flex b3-label">
    <div
        class="fn__flex-1"
        class:visible={block}
    >
        {#if titleSlot}
            {@render titleSlot()}
        {:else}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html title}
        {/if}
        <div class="b3-label__text">
            {#if textSlot}
                {@render textSlot()}
            {:else}
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html text}
            {/if}
        </div>

        {#if block}
            <div class="fn__hr"></div>
            {@render input?.()}
        {/if}
    </div>

    {#if !block}
        <span class="fn__space"></span>
        {@render input?.()}
    {/if}
</label>

<style lang="less">
    .visible {
        overflow: visible;
    }
</style>

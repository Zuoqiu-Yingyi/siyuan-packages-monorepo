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
    import {
        createEventDispatcher,
        onMount,
    } from "svelte";

    import type { IMenuItemEvent } from ".";

    export let icon: string = ""; // 图标
    export let font: string = ""; // 菜单项文本字体样式
    export let label: string = ""; // 菜单项文本/input/textarea 提示
    export let disabled: boolean = false; // 是否禁用

    export let input: boolean = false; // 是否为输入框
    export let value: string = ""; // 输入框内容
    export let accelerator: string = ""; // 捷径提示

    export let textarea: boolean = false; // 是否为多行输入框
    export let rows: number = 1; // 多行输入框显示行数

    export let checkbox: boolean = false; // 是否为复选框 (开关)
    export let checked: boolean = false; // 复选框是否被选中 (开关是否开启)

    export let file: boolean = false; // 是否为文件上传
    export let accept: string = ""; // 文件上传类型
    // REF: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/file#multiple
    export let multiple: boolean = true; // 是否支持多文件/文件夹上传
    // REF: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/file#webkitdirectory
    export let webkitdirectory: boolean = true; // 是否支持文件夹上传

    let files: FileList | null = null; // 上传的文件列表
    let element: HTMLInputElement;

    /* 动态设置 webkitdirectory */
    function setWebkitdirectory(enable: boolean): void {
        if (element) {
            element.webkitdirectory = enable;
        }
    }

    $: setWebkitdirectory(webkitdirectory);

    onMount(() => {
        setWebkitdirectory(webkitdirectory);
    });

    const dispatch = createEventDispatcher<IMenuItemEvent>();

    function changed(event: Event) {
        dispatch("changed", { value, event });
    }

    function switched(event: Event) {
        dispatch("switched", { checked, event });
    }

    function selected(event: Event) {
        dispatch("selected", { files, event });
    }
</script>

<!-- 菜单项图标 -->
{#if icon}
    <svg class="b3-menu__icon">
        <use xlink:href={icon} />
    </svg>
{:else}
    <slot name="icon">
        <svg class="b3-menu__icon">
            <use xlink:href="#" />
        </svg>
    </slot>
{/if}

<!-- 菜单项标签 -->
<span
    style:font
    style:position={file ? "relative" : "initial"}
    class="b3-menu__label"
>
    {#if input}
        <!-- 文本输入框 -->
        <div class="fn__hr--small"></div>
        <input
            bind:this={element}
            class="b3-text-field fn__size200"
            {disabled}
            placeholder={label}
            bind:value
            on:change={changed}
        />
        <div class="fn__hr--small"></div>
    {:else if textarea}
        <!-- 多行文本输入框 -->
        <textarea
            class="b3-text-field fn__block"
            {disabled}
            placeholder={label}
            rows={rows}
            spellcheck="false"
            bind:value
            on:change={changed}
        ></textarea>
    {:else if checkbox}
        <!-- 开关 -->
        <div class="fn__flex">
            <span>{label}</span>
            <span class="fn__space fn__flex-1"></span>
            <input
                class="b3-switch fn__flex-center"
                checked={checked}
                type="checkbox"
                on:change={switched}
            />
        </div>
    {:else}
        <!-- 文本 -->
        {label}
    {/if}

    {#if file}
        <!-- 文件上传输入框 -->
        <input
            bind:this={element}
            class="file-input"
            {accept}
            {disabled}
            {multiple}
            type="file"
            bind:files
            on:change={selected}
        />
    {/if}
</span>

<!-- 菜单项捷径提示 -->
{#if accelerator}
    <span class="b3-menu__accelerator">
        {accelerator}
    </span>
{/if}

<style lang="less">
    /* 文件选择框覆盖在菜单项文本上方 */
    .file-input {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        opacity: 0;
        overflow: hidden;
        cursor: pointer;
    }
</style>

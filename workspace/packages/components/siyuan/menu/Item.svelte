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

    import type { IMenuItemEvent } from ".";

    export interface IProps {
        icon?: string; // 图标
        font?: string; // 菜单项文本字体样式
        label?: string; // 菜单项文本/input/textarea 提示
        disabled?: boolean; // 是否禁用

        input?: boolean; // 是否为输入框
        value?: string; // 输入框内容
        accelerator?: string; // 捷径提示

        textarea?: boolean; // 是否为多行输入框
        rows?: number; // 多行输入框显示行数

        checkbox?: boolean; // 是否为复选框 (开关)
        checked?: boolean; // 复选框是否被选中 (开关是否开启)

        file?: boolean; // 是否为文件上传
        accept?: string; // 文件上传类型
        // REF: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/file#multiple
        multiple?: boolean; // 是否支持多文件/文件夹上传
        // REF: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/file#webkitdirectory
        webkitdirectory?: boolean; // 是否支持文件夹上传
    }

    export interface IHandlers {
        onChanged?: (params: IMenuItemEvent["changed"]) => void; // 文本输入框内容更改
        onSwitched?: (params: IMenuItemEvent["switched"]) => void; // 复选框状态更改
        onSelected?: (params: IMenuItemEvent["selected"]) => void; // 文件选择器选择文件
    }

    export interface ISlots {
        iconSlot?: Snippet; // 自定义菜单项图标
    }

    export type TProps = IProps & IHandlers & ISlots;
</script>

<script lang="ts">
    let {
        icon = "",
        font = "",
        label = "",
        disabled = false,

        input = false,
        value = $bindable(""),
        accelerator = "",

        textarea = false,
        rows = 1,

        checkbox = false,
        checked = false,

        file = false,
        accept = "",
        multiple = true,
        webkitdirectory = true,

        onChanged,
        onSwitched,
        onSelected,

        iconSlot,
    }: TProps = $props();

    let files: FileList | null = $state(null); // 上传的文件列表
    let element: HTMLInputElement | undefined = $state();

    /* 动态设置 webkitdirectory */
    $effect(() => {
        if (element) {
            element.webkitdirectory = webkitdirectory;
        }
    });

    function changed(event: Event) {
        onChanged?.({ value, event });
    }

    function switched(event: Event) {
        onSwitched?.({ checked, event });
    }

    function selected(event: Event) {
        onSelected?.({ files, event });
    }
</script>

<!-- 菜单项图标 -->
{#if icon}
    <svg class="b3-menu__icon">
        <use xlink:href={icon} />
    </svg>
{:else if iconSlot}
    {@render iconSlot()}
{:else}
    <svg class="b3-menu__icon">
        <use xlink:href="#" />
    </svg>
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
            onchange={changed}
            placeholder={label}
            bind:value
        />
        <div class="fn__hr--small"></div>
    {:else if textarea}
        <!-- 多行文本输入框 -->
        <textarea
            class="b3-text-field fn__block"
            {disabled}
            onchange={changed}
            placeholder={label}
            {rows}
            spellcheck="false"
            bind:value
        ></textarea>
    {:else if checkbox}
        <!-- 开关 -->
        <div class="fn__flex">
            <span>{label}</span>
            <span class="fn__space fn__flex-1"></span>
            <input
                class="b3-switch fn__flex-center"
                {checked}
                onchange={switched}
                type="checkbox"
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
            onchange={selected}
            type="file"
            bind:files
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

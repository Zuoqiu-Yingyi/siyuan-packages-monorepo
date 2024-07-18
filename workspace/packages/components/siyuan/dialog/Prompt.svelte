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
        type ComponentEvents,
    } from "svelte";

    import Dialog from "./Dialog.svelte";

    import type { IPromptEvent } from "./event";

    export let text: string = ""; // 提示文本
    export let value: string = ""; // 输入框默认内容
    export let placeholder: string = ""; // 输入框空白提示内容
    export let tips: string = ""; // 输入框提示内容
    export let listID: string = Math.random().toString(36).slice(2); // 数据列表 ID
    export let datalist: string[] = []; // 输入框数据列表
    export let selectable: boolean = true; // 是否可选择
    export let autofocus: boolean = true; // 是否自动聚焦

    export let cancelButtonText: string = window.siyuan?.languages?.cancel ?? "Cancel"; // 取消按钮文本
    export let confirmButtonText: string = window.siyuan?.languages?.confirm ?? "Confirm"; // 确定按钮文本

    const dispatcher = createEventDispatcher<IPromptEvent>();

    function onCancle(event: ComponentEvents<Dialog>["cancel"]): void {
        dispatcher("cancel", { value, event: event.detail.event });
    }
    function onConfirm(event: ComponentEvents<Dialog>["confirm"]): void {
        dispatcher("confirm", { value, event: event.detail.event });
    }
    function onChange(event: Event): void {
        dispatcher("change", { value, event });
    }
    function onInput(event: Event): void {
        dispatcher("input", { value, event });
    }
</script>

<Dialog
    {cancelButtonText}
    {confirmButtonText}
    {selectable}
    on:cancel={onCancle}
    on:confirm={onConfirm}
>
    <!-- 提示文本 -->
    <slot name="text">
        <div class="ft__breakword">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html text}
        </div>
    </slot>

    <br />

    <!-- 输入框 -->
    <slot name="input">
        <!-- svelte-ignore a11y-autofocus -->
        <input
            class="b3-text-field fn__block"
            {autofocus}
            list={listID}
            {placeholder}
            bind:value
            on:input={onInput}
            on:change={onChange}
        />
        <!-- REF: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/datalist -->
        {#if datalist.length > 0}
            <datalist id={listID}>
                {#each datalist as value}
                    <option {value} />
                {/each}
            </datalist>
        {/if}
    </slot>

    <!-- 内容提示 -->
    <slot name="tips">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html tips}
    </slot>
</Dialog>

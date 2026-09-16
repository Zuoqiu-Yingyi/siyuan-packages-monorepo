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

    import type { IPromptEvent } from "./event";

    export interface IProps {
        text?: string; // 提示文本
        value?: string; // 输入框默认内容
        placeholder?: string; // 输入框空白提示内容
        tips?: string; // 输入框提示内容
        listID?: string; // 数据列表 ID
        datalist?: string[]; // 输入框数据列表
        selectable?: boolean; // 是否可选择
        autofocus?: boolean; // 是否自动聚焦

        cancelButtonText?: string; // 取消按钮文本
        confirmButtonText?: string; // 确定按钮文本
    }

    export interface IHandlers {
        onCancel?: (params: IPromptEvent["cancel"]) => void; // 点击取消按钮
        onConfirm?: (params: IPromptEvent["confirm"]) => void; // 点击确定按钮
        onChange?: (params: IPromptEvent["change"]) => void; // 输入框内容变更
        onInput?: (params: IPromptEvent["input"]) => void; // 输入框输入
    }

    export interface ISlots {
        textSlot?: Snippet; // 自定义提示文本 (代替 text)
        inputSlot?: Snippet; // 自定义输入框
        tipsSlot?: Snippet; // 自定义内容提示 (代替 tips)
    }

    export type TProps = IProps & IHandlers & ISlots;
</script>

<script lang="ts">
    import Dialog from "./Dialog.svelte";

    import type { IDialogEvent } from "./event";

    let {
        text = "",
        value = $bindable(""),
        placeholder = "",
        tips = "",
        listID = Math.random().toString(36).slice(2),
        datalist = [],
        selectable = true,
        autofocus = true,

        cancelButtonText = window.siyuan?.languages?.cancel ?? "Cancel",
        confirmButtonText = window.siyuan?.languages?.confirm ?? "Confirm",

        onCancel,
        onConfirm,
        onChange,
        onInput,

        textSlot,
        inputSlot,
        tipsSlot,
    }: TProps = $props();

    function _onCancle(params: IDialogEvent["cancel"]): void {
        onCancel?.({ value, event: params.event });
    }
    function _onConfirm(params: IDialogEvent["confirm"]): void {
        onConfirm?.({ value, event: params.event });
    }
    function _onChange(event: Event): void {
        onChange?.({ value, event });
    }
    function _onInput(event: Event): void {
        onInput?.({ value, event });
    }
</script>

<Dialog
    {cancelButtonText}
    {confirmButtonText}
    onCancel={_onCancle}
    onConfirm={_onConfirm}
    {selectable}
>
    <!-- 提示文本 -->
    {#if textSlot}
        {@render textSlot()}
    {:else}
        <div class="ft__breakword">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html text}
        </div>
    {/if}

    <br />

    <!-- 输入框 -->
    {#if inputSlot}
        {@render inputSlot()}
    {:else}
        <!-- svelte-ignore a11y_autofocus -->
        <input
            class="b3-text-field fn__block"
            {autofocus}
            list={listID}
            onchange={_onChange}
            oninput={_onInput}
            {placeholder}
            bind:value
        />
        <!-- REF: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/datalist -->
        {#if datalist.length > 0}
            <datalist id={listID}>
                {#each datalist as value (value)}
                    <option {value}></option>
                {/each}
            </datalist>
        {/if}
    {/if}

    <!-- 内容提示 -->
    {#if tipsSlot}
        {@render tipsSlot()}
    {:else}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html tips}
    {/if}
</Dialog>

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
    import { createEventDispatcher } from "svelte";

    import type { IDialogEvent } from "./event";

    export let selectable: boolean = true; // 是否可选择

    export let cancelButtonText: string = window.siyuan?.languages?.cancel ?? "Cancel"; // 取消按钮文本
    export let confirmButtonText: string = window.siyuan?.languages?.confirm ?? "Confirm"; // 确定按钮文本

    let cancel: HTMLButtonElement | undefined; // 取消按钮
    let confirm: HTMLButtonElement | undefined; // 确认按钮

    void cancel;
    void confirm;

    const dispatcher = createEventDispatcher<IDialogEvent>();

    function onCancle(event: MouseEvent): void {
        dispatcher("cancel", { event });
    }
    function onConfirm(event: MouseEvent): void {
        dispatcher("confirm", { event });
    }
</script>

<div
    style:user-select={selectable ? "auto" : "none"}
    class="b3-dialog__content"
>
    <!-- 内容 -->
    <slot />
</div>

<!-- 按鈕 -->
<div class="b3-dialog__action">
    <button
        bind:this={cancel}
        class="b3-button b3-button--cancel"
        on:click={onCancle}
    >
        {cancelButtonText}
    </button>
    <div class="fn__space" />
    <button
        bind:this={confirm}
        class="b3-button b3-button--text"
        on:click={onConfirm}
    >
        {confirmButtonText}
    </button>
</div>

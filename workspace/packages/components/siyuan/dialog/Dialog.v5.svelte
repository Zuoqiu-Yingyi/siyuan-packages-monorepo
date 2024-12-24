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
    import type { IDialogEvent } from "./event";

    export interface IProps {
        selectable?: boolean; // 是否可选择
        cancelButtonText?: string; // 取消按钮文本
        confirmButtonText?: string; // 确定按钮文本
    }

    export interface IHandlers {
        onCancel?: (params: IDialogEvent["cancel"]) => void;
        onConfirm?: (params: IDialogEvent["confirm"]) => void;
    }

    export type TProps = IProps & IHandlers;
</script>

<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";

    const {
        selectable = true,
        cancelButtonText = window.siyuan?.languages?.cancel ?? "Cancel",
        confirmButtonText = window.siyuan?.languages?.confirm ?? "Confirm",

        onCancel,
        onConfirm,

        children,
    }: TProps & HTMLAttributes<HTMLElement> = $props();

    let cancel: HTMLButtonElement | undefined; // 取消按钮
    let confirm: HTMLButtonElement | undefined; // 确认按钮

    function _onCancle(event: MouseEvent): void {
        onCancel?.({ event });
    }
    function _onConfirm(event: MouseEvent): void {
        onConfirm?.({ event });
    }
</script>

<div
    style:user-select={selectable ? "auto" : "none"}
    class="b3-dialog__content"
>
    <!-- 内容 -->
    {@render children?.()}
</div>

<!-- 按鈕 -->
<div class="b3-dialog__action">
    <button
        bind:this={cancel}
        class="b3-button b3-button--cancel"
        onclick={_onCancle}
    >
        {cancelButtonText}
    </button>
    <div class="fn__space"></div>
    <button
        bind:this={confirm}
        class="b3-button b3-button--text"
        onclick={_onConfirm}
    >
        {confirmButtonText}
    </button>
</div>

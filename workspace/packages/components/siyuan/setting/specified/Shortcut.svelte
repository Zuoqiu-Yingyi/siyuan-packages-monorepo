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

<!-- 快捷键 -->

<script lang="ts">
    import {
        createEventDispatcher,
        type ComponentEvents,
    } from "svelte";

    import {
        MouseButton,
        MouseEvent,
        type IFunctionKeysStatus,
        type IMouseStatus,
    } from "@workspace/utils/shortcut";

    import Svg from "./../../misc/Svg.svelte";
    import Group from "./../item/Group.svelte";
    import Input from "./../item/Input.svelte";
    import { ItemType } from "./../item/item";
    import MiniItem from "./../item/MiniItem.svelte";

    import type { IShortcutEvent } from "./../event";

    export let title: string; // 标题
    export let shortcut: IMouseStatus; // 快捷键

    /* 最小宽度 */
    export let minWidth: string;
    export let marginRight: string;

    /* 是否显示 */
    export let displayCtrlKey = true;
    export let displayShiftKey = true;
    export let displayAltKey = true;
    export let displayMetaKey = true;
    export let displayMouseButton = true;
    export let displayMouseEvent = true;

    /* 是否禁用 */
    export let disabledCtrlKey = false;
    export let disabledShiftKey = false;
    export let disabledAltKey = false;
    export let disabledMetaKey = false;
    export let disabledMouseButton = false;
    export let disabledMouseEvent = false;

    /* 显示内容 */
    export let mouseButtonTitle = "Mouse Button";
    export let mouseEventTitle = "Mouse Event";
    export let mouseButtonOptions = [
        { key: MouseButton.Left, text: "Left" },
        { key: MouseButton.Middle, text: "Middle" },
        { key: MouseButton.Right, text: "Right" },
        { key: MouseButton.Back, text: "Back" },
        { key: MouseButton.Forward, text: "Forward" },
    ];
    export let mouseEventOptions = [
        { key: MouseEvent.click, text: MouseEvent.click },
        { key: MouseEvent.dblclick, text: MouseEvent.dblclick },
        { key: MouseEvent.mousedown, text: MouseEvent.mousedown },
        { key: MouseEvent.mouseup, text: MouseEvent.mouseup },
        { key: MouseEvent.mouseenter, text: MouseEvent.mouseenter },
        { key: MouseEvent.mouseleave, text: MouseEvent.mouseleave },
        { key: MouseEvent.mousewheel, text: MouseEvent.mousewheel },
        { key: MouseEvent.mouseover, text: MouseEvent.mouseover },
        { key: MouseEvent.mousemove, text: MouseEvent.mousemove },
        { key: MouseEvent.mouseout, text: MouseEvent.mouseout },
    ];

    const dispatch = createEventDispatcher<IShortcutEvent>();
    function changed(e: ComponentEvents<Input>["changed"]) {
        if (e.detail.key in shortcut) {
            shortcut[e.detail.key as (keyof IFunctionKeysStatus)] = e.detail.value as boolean;
        }
        dispatch("changed", { shortcut });
    }
</script>

<Group {title}>
    {#if displayCtrlKey}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            <Svg
                className="svg"
                icon="#iconKeymap"
            />
            <kbd slot="title">Ctrl</kbd>
            <Input
                slot="input"
                disabled={disabledCtrlKey}
                normal={false}
                settingKey="ctrlKey"
                settingValue={shortcut.ctrlKey}
                type={ItemType.checkbox}
                on:changed={changed}
            />
        </MiniItem>
    {/if}
    {#if displayShiftKey}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            <Svg
                className="svg"
                icon="#iconKeymap"
            />
            <kbd slot="title">Shift</kbd>
            <Input
                slot="input"
                disabled={disabledShiftKey}
                normal={false}
                settingKey="shiftKey"
                settingValue={shortcut.shiftKey}
                type={ItemType.checkbox}
                on:changed={changed}
            />
        </MiniItem>
    {/if}
    {#if displayAltKey}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            <Svg
                className="svg"
                icon="#iconKeymap"
            />
            <kbd slot="title">Alt</kbd>
            <Input
                slot="input"
                disabled={disabledAltKey}
                normal={false}
                settingKey="altKey"
                settingValue={shortcut.altKey}
                type={ItemType.checkbox}
                on:changed={changed}
            />
        </MiniItem>
    {/if}
    {#if displayMetaKey}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            <Svg
                className="svg"
                icon="#iconKeymap"
            />
            <kbd slot="title">Meta</kbd>
            <Input
                slot="input"
                disabled={disabledMetaKey}
                normal={false}
                settingKey="metaKey"
                settingValue={shortcut.metaKey}
                type={ItemType.checkbox}
                on:changed={changed}
            />
        </MiniItem>
    {/if}
    {#if displayMouseButton}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            <Svg
                className="svg"
                icon="#iconSelectText"
            />
            <span slot="title">{mouseButtonTitle}</span>
            <Input
                slot="input"
                disabled={disabledMouseButton}
                normal={false}
                options={mouseButtonOptions}
                settingKey="button"
                settingValue={shortcut.button}
                type={ItemType.select}
                on:changed={changed}
            />
        </MiniItem>
    {/if}
    {#if displayMouseEvent}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            <Svg
                className="svg"
                icon="#iconSelectText"
            />
            <span slot="title">{mouseEventTitle}</span>
            <Input
                slot="input"
                disabled={disabledMouseEvent}
                normal={false}
                options={mouseEventOptions}
                settingKey="type"
                settingValue={shortcut.type}
                type={ItemType.select}
                on:changed={changed}
            />
        </MiniItem>
    {/if}
</Group>

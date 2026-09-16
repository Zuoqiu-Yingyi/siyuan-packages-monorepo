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

<script
    lang="ts"
    module
>
    import type { IMouseStatus } from "@workspace/utils/shortcut";

    import type { IShortcutEvent } from "./../event";

    import type { IProps as IInputProps } from "./../item/Input.svelte";

    export interface IProps {
        title: string; // 标题
        shortcut: IMouseStatus; // 快捷键

        /* 最小宽度 */
        minWidth?: string;
        marginRight?: string;

        /* 是否显示 */
        displayCtrlKey?: boolean;
        displayShiftKey?: boolean;
        displayAltKey?: boolean;
        displayMetaKey?: boolean;
        displayMouseButton?: boolean;
        displayMouseEvent?: boolean;

        /* 是否禁用 */
        disabledCtrlKey?: boolean;
        disabledShiftKey?: boolean;
        disabledAltKey?: boolean;
        disabledMetaKey?: boolean;
        disabledMouseButton?: boolean;
        disabledMouseEvent?: boolean;

        /* 显示内容 */
        mouseButtonTitle?: string;
        mouseEventTitle?: string;
        mouseButtonOptions?: NonNullable<IInputProps["options"]>;
        mouseEventOptions?: NonNullable<IInputProps["options"]>;
    }

    export interface IHandlers {
        onChanged?: (params: IShortcutEvent["changed"]) => void; // 快捷键变更
    }

    export type TProps = IProps & IHandlers;
</script>

<script lang="ts">
    import { MouseButton, MouseEvent } from "@workspace/utils/shortcut";

    import { ItemType } from "./../item/item";

    import Svg from "./../../misc/Svg.svelte";
    import Group from "./../item/Group.svelte";
    import Input from "./../item/Input.svelte";
    import MiniItem from "./../item/MiniItem.svelte";

    import type { IFunctionKeysStatus } from "@workspace/utils/shortcut";

    import type { IInputEvent } from "./../event";

    const {
        title,
        shortcut = $bindable(),

        minWidth = undefined,
        marginRight = undefined,

        displayCtrlKey = true,
        displayShiftKey = true,
        displayAltKey = true,
        displayMetaKey = true,
        displayMouseButton = true,
        displayMouseEvent = true,

        disabledCtrlKey = false,
        disabledShiftKey = false,
        disabledAltKey = false,
        disabledMetaKey = false,
        disabledMouseButton = false,
        disabledMouseEvent = false,

        mouseButtonTitle = "Mouse Button",
        mouseEventTitle = "Mouse Event",
        mouseButtonOptions = [
            { key: MouseButton.Left, text: "Left" },
            { key: MouseButton.Middle, text: "Middle" },
            { key: MouseButton.Right, text: "Right" },
            { key: MouseButton.Back, text: "Back" },
            { key: MouseButton.Forward, text: "Forward" },
        ],
        mouseEventOptions = [
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
        ],

        onChanged,
    }: TProps = $props();

    function changed(params: IInputEvent["changed"]) {
        if (params.key in shortcut) {
            shortcut[params.key as keyof IFunctionKeysStatus] = params.value as boolean;
        }
        onChanged?.({ shortcut });
    }
</script>

<Group {title}>
    {#if displayCtrlKey}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            {#snippet icon()}
                <Svg
                    className="svg"
                    icon="#iconKeymap"
                />
            {/snippet}
            {#snippet title()}
                <kbd>Ctrl</kbd>
            {/snippet}
            {#snippet input()}
                <Input
                    disabled={disabledCtrlKey}
                    normal={false}
                    onChanged={changed}
                    settingKey="ctrlKey"
                    settingValue={shortcut.ctrlKey}
                    type={ItemType.checkbox}
                />
            {/snippet}
        </MiniItem>
    {/if}
    {#if displayShiftKey}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            {#snippet icon()}
                <Svg
                    className="svg"
                    icon="#iconKeymap"
                />
            {/snippet}
            {#snippet title()}
                <kbd>Shift</kbd>
            {/snippet}
            {#snippet input()}
                <Input
                    disabled={disabledShiftKey}
                    normal={false}
                    onChanged={changed}
                    settingKey="shiftKey"
                    settingValue={shortcut.shiftKey}
                    type={ItemType.checkbox}
                />
            {/snippet}
        </MiniItem>
    {/if}
    {#if displayAltKey}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            {#snippet icon()}
                <Svg
                    className="svg"
                    icon="#iconKeymap"
                />
            {/snippet}
            {#snippet title()}
                <kbd>Alt</kbd>
            {/snippet}
            {#snippet input()}
                <Input
                    disabled={disabledAltKey}
                    normal={false}
                    onChanged={changed}
                    settingKey="altKey"
                    settingValue={shortcut.altKey}
                    type={ItemType.checkbox}
                />
            {/snippet}
        </MiniItem>
    {/if}
    {#if displayMetaKey}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            {#snippet icon()}
                <Svg
                    className="svg"
                    icon="#iconKeymap"
                />
            {/snippet}
            {#snippet title()}
                <kbd>Meta</kbd>
            {/snippet}
            {#snippet input()}
                <Input
                    disabled={disabledMetaKey}
                    normal={false}
                    onChanged={changed}
                    settingKey="metaKey"
                    settingValue={shortcut.metaKey}
                    type={ItemType.checkbox}
                />
            {/snippet}
        </MiniItem>
    {/if}
    {#if displayMouseButton}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            {#snippet icon()}
                <Svg
                    className="svg"
                    icon="#iconSelectText"
                />
            {/snippet}
            {#snippet title()}
                <span>{mouseButtonTitle}</span>
            {/snippet}
            {#snippet input()}
                <Input
                    disabled={disabledMouseButton}
                    normal={false}
                    onChanged={changed}
                    options={mouseButtonOptions}
                    settingKey="button"
                    settingValue={shortcut.button}
                    type={ItemType.select}
                />
            {/snippet}
        </MiniItem>
    {/if}
    {#if displayMouseEvent}
        <MiniItem
            {marginRight}
            {minWidth}
        >
            {#snippet icon()}
                <Svg
                    className="svg"
                    icon="#iconSelectText"
                />
            {/snippet}
            {#snippet title()}
                <span>{mouseEventTitle}</span>
            {/snippet}
            {#snippet input()}
                <Input
                    disabled={disabledMouseEvent}
                    normal={false}
                    onChanged={changed}
                    options={mouseEventOptions}
                    settingKey="button"
                    settingValue={shortcut.type}
                    type={ItemType.select}
                />
            {/snippet}
        </MiniItem>
    {/if}
</Group>

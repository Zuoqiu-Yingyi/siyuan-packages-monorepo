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

<!-- 设置项输入组件 -->

<script
    lang="ts"
    module
>
    import { ItemType } from "./item";

    import type { IInputEvent } from "./../event";
    import type { ILimits, IOptions } from "./item";

    export interface IProps {
        type: ItemType; // Setting Type
        settingKey: string;
        settingValue: any;

        disabled?: boolean; // Disable Input
        block?: boolean; // Using Block Style
        normal?: boolean; // Normal Size
        placeholder?: string; // Use it if type is text/number/textarea
        options?: IOptions; // Use it if type is select
        limits?: ILimits; // Use it if type is number/slider
        height?: number; // Use it if type is textarea
        fontFamily?: string; // Use it if type is textarea
    }

    export interface IHandlers {
        onClicked?: (params: IInputEvent["clicked"]) => void; // 按钮点击
        onChanged?: (params: IInputEvent["changed"]) => void; // 设置项值变更
    }

    export type TProps = IProps & IHandlers;
</script>

<script lang="ts">
    let {
        type,
        settingKey,
        settingValue = $bindable(),

        disabled = false,
        block = false,
        normal = true,
        placeholder = "",
        options = [],
        limits = { min: 0, max: 100, step: 1 },
        height = 0,
        fontFamily = "",

        onClicked,
        onChanged,
    }: TProps = $props();

    function clicked(event: MouseEvent) {
        onClicked?.({ event });
    }

    function changed(event: Event) {
        onChanged?.({ key: settingKey, value: settingValue, event });
    }
</script>

{#if type === ItemType.checkbox}
    <!-- Checkbox -->
    <input
        class="b3-switch"
        class:fn__block={block}
        class:fn__flex-center={!block}
        {disabled}
        onchange={changed}
        type="checkbox"
        bind:checked={settingValue}
    />
{:else if type === ItemType.text}
    <!-- Text Input -->
    <input
        class="b3-text-field"
        class:fn__block={block}
        class:fn__flex-center={!block}
        class:fn__size200={!block && normal}
        {disabled}
        onchange={changed}
        {placeholder}
        bind:value={settingValue}
    />
{:else if type === ItemType.number}
    <!-- Number Input -->
    <input
        class="b3-text-field"
        class:fn__block={block}
        class:fn__flex-center={!block}
        class:fn__size200={!block && normal}
        {disabled}
        max={limits.max}
        min={limits.min}
        onchange={changed}
        {placeholder}
        step={limits.step}
        type="number"
        bind:value={settingValue}
    />
{:else if type === ItemType.slider}
    <!-- Slider -->
    <input
        class="b3-slider"
        class:fn__block={block}
        class:fn__size200={!block && normal}
        {disabled}
        max={limits.max}
        min={limits.min}
        onchange={changed}
        step={limits.step}
        type="range"
        bind:value={settingValue}
    />
{:else if type === ItemType.button}
    <!-- Button Input -->
    <button
        class="b3-button b3-button--outline"
        class:fn__block={block}
        class:fn__flex-center={!block}
        class:fn__size200={!block && normal}
        {disabled}
        onclick={clicked}
    >
        {settingValue}
    </button>
{:else if type === ItemType.select}
    <!-- Dropdown select -->
    <select
        class="b3-select"
        class:fn__block={block}
        class:fn__flex-center={!block}
        class:fn__size200={!block && normal}
        {disabled}
        onchange={changed}
        bind:value={settingValue}
    >
        {#each options as option (option.key)}
            <option
                title={option.title}
                value={option.key}
            >
                {option.text}
            </option>
        {/each}
    </select>
{:else if type === ItemType.textarea}
    <!-- Text Area -->
    <textarea
        style:height={height > 0 ? `${height}px` : undefined}
        style:font-family={fontFamily || undefined}
        class="b3-text-field"
        class:fn__block={block}
        class:fn__size200={!block && normal}
        {disabled}
        onchange={changed}
        {placeholder}
        bind:value={settingValue}
    ></textarea>
{/if}

<style lang="less">
    .fn__block {
        &.b3-switch {
            overflow: visible;
            padding-left: 1em;
        }

        &.b3-slider {
            padding: 0;
        }
    }
</style>

<!--
 Copyright (C) 2026 Zuoqiu Yingyi

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
    export interface IProps {
        icon: string; // svg 图标引用 ID
        none?: boolean; // 是否隐藏 .fn__none (display: none)
        active?: boolean; // 是否激活 .toolbar__item--active
        disabled?: boolean; // 是否禁用 .toolbar__item--disabled
        ariaLabel?: string; // 提示标签内容 aria-label
    }

    export interface IHandlers {}

    export interface ISlots {}

    export type TProps = IProps & IHandlers & ISlots;
</script>

<script lang="ts">
    import Svg from "./Svg.svelte";

    const { icon = "#iconHelp", none = false, active = false, disabled = false, ariaLabel = "" }: TProps = $props();
</script>

<div
    class="toolbar__item"
    class:ariaLabel={ariaLabel !== ""}
    class:fn__none={none}
    class:toolbar__item--active={active}
    class:toolbar__item--disabled={disabled}
    aria-label={ariaLabel}
>
    <Svg {icon} />
</div>

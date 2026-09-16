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

<!-- 小型设置项(用于设置项组内) -->

<script
    lang="ts"
    module
>
    import type { Snippet } from "svelte";

    export interface IProps {
        minWidth?: string; // 最小宽度
        marginRight?: string; // 右侧外边距
    }

    export interface ISlots {
        icon?: Snippet; // 图标
        title?: Snippet; // 标题
        input?: Snippet; // 设置项控件
    }

    export type TProps = IProps & ISlots;
</script>

<script lang="ts">
    const {
        minWidth = "24em",
        marginRight = "2em",

        icon,
        title,
        input,
    }: TProps = $props();
</script>

<label
    style="min-width: {minWidth}; margin-right: {marginRight};"
    class="fn__flex"
>
    {@render icon?.()}

    <span class="fn__space"></span>

    <div class="fn__flex-1">
        {@render title?.()}
    </div>

    <span class="fn__space"></span>

    {@render input?.()}
</label>

<style lang="less">
    label {
        width: unset;
        margin: 0.5em 0;
    }
</style>

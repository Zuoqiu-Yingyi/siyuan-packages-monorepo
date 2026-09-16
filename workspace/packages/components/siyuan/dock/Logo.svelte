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
    export interface IProps {
        icon?: string; // 图标
        title?: string; // 标题
    }

    export type TProps = IProps;
</script>

<script lang="ts">
    import Svg from "./../misc/Svg.svelte";

    const {
        icon = "",
        title = "",
    }: TProps = $props();
</script>

<div class="block__logo">
    {#if icon}
        <Svg
            className="block__logoicon"
            {icon}
        />
    {/if}
    {#if title}
        {title}
    {/if}
</div>

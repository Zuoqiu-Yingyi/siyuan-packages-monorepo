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
    import regexp from "@workspace/utils/regexp";

    import Svg from "./Svg.svelte";

    export let icon: string;
    export let id: string = "";
    export let className: string = "";
    export let style: string = "";
</script>

{#if icon.startsWith("#")}
    <!-- svg 图标 -->
    <Svg
        {id}
        {style}
        {className}
        {icon}
    />
{:else if icon.startsWith("/") || icon.startsWith("http") || icon.startsWith("data") || icon.startsWith("blob")}
    <!-- url 图标 -->
    <img
        {style}
        class={className}
        class:b3-list-item__icon={true}
        class:popover__block={regexp.id.test(id)}
        data-id={id}
        alt="icon"
        src={icon}
    />
{:else if icon.startsWith("<") && icon.endsWith(">")}
    <!-- HTML 元素图标 -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html icon}
{:else if icon}
    <!-- emojis 字符图标 -->
    {icon}
{:else}
    <!-- 未知图标 -->
    <Svg
        {id}
        {style}
        {className}
        icon="#iconHelp"
    />
{/if}

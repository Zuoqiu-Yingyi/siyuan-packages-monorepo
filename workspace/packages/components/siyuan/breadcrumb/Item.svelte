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

    import type { IBreadcrumbItem } from ".";

    export interface IProps {
        itemId?: IBreadcrumbItem["itemId"]; // 块 ID
        iconId?: IBreadcrumbItem["iconId"]; // 图标关联的块 ID
        icon?: IBreadcrumbItem["icon"]; // 图标
        text?: IBreadcrumbItem["text"]; // 文本
        textTitle?: IBreadcrumbItem["textTitle"]; // 文本提示
        textEllipsis?: IBreadcrumbItem["textEllipsis"]; // 文本过长时是否省略
        active?: IBreadcrumbItem["active"]; // 是否激活
    }

    export interface ISlots {
        svg?: Snippet; // 自定义图标
    }

    export type TProps = IProps & ISlots;
</script>

<script lang="ts">
    import Svg from "./../misc/Svg.svelte";

    const {
        itemId = "",

        iconId = "",
        icon = "",

        text = "",
        textTitle = "",
        textEllipsis = true,

        active = false,

        svg,
    }: TProps = $props();
</script>

<span
    class="protyle-breadcrumb__item"
    class:protyle-breadcrumb__item--active={active}
    data-node-id={itemId}
>
    {#if svg}
        {@render svg()}
    {:else if icon}
        <Svg
            id={iconId}
            {icon}
        />
    {/if}

    <span
        class="protyle-breadcrumb__text"
        class:protyle-breadcrumb__text--ellipsis={textEllipsis}
        title={textTitle}
    >
        {text}
    </span>
</span>

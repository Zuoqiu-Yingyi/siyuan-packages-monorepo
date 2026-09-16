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

    import type { IProps as IBreadcrumbProps } from "./../breadcrumb/Breadcrumb.svelte";

    export interface IProps {
        fullscreen?: boolean; // 是否为全屏模式
        breadcrumb?: boolean; // 是否显示面包屑
        breadcrumbItems?: IBreadcrumbProps["items"]; // 面包屑元素列表
        breadcrumbIcons?: IBreadcrumbProps["icons"]; // 面包屑按钮列表
    }

    export interface ISlots {
        breadcrumbSlot?: Snippet; // 自定义面包屑
        content?: Snippet; // 页签内容
    }

    export type TProps = IProps & ISlots;
</script>

<script lang="ts">
    import Breadcrumb from "./../breadcrumb/Breadcrumb.svelte";

    const {
        fullscreen = false,

        breadcrumb = true,
        breadcrumbItems = [],
        breadcrumbIcons = [],

        breadcrumbSlot,
        content,
    }: TProps = $props();
</script>

<div
    class="fn__flex-column"
    class:fullscreen
>
    {#if breadcrumbSlot}
        {@render breadcrumbSlot()}
    {:else if breadcrumb}
        <Breadcrumb
            icons={breadcrumbIcons}
            items={breadcrumbItems}
        />
    {/if}
    <div class="protyle-preview">
        {@render content?.()}
    </div>
</div>

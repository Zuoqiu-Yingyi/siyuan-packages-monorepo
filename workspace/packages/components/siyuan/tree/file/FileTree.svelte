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
    import type { IFileTreeHandlers, IFileTreeRootNode } from ".";

    export interface IProps {
        roots?: IFileTreeRootNode[]; // 根节点列表
    }

    export type TProps = IProps & IFileTreeHandlers;
</script>

<script lang="ts">
    import Root from "./Root.svelte";

    const {
        roots = [],

        onOpen,
        onMenu,
        onFold,
        onUnfold,
        onDrag,
        onDragstart,
        onDragend,
        onDragenter,
        onDragover,
        onDragleave,
        onDrop,
    }: TProps = $props();
</script>

<div class="fn__flex-1 file-tree">
    {#each roots as root (root.path)}
        <Root
            {onDrag}
            {onDragend}
            {onDragenter}
            {onDragleave}
            {onDragover}
            {onDragstart}
            {onDrop}
            {onFold}
            {onMenu}
            {onOpen}
            {onUnfold}
            {root}
        />
    {/each}
</div>

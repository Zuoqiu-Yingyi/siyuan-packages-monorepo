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
        root: IFileTreeRootNode; // 根节点
    }

    export type TProps = IProps & IFileTreeHandlers;
</script>

<script lang="ts">
    import Node from "./Node.svelte";

    const {
        root,

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

<ul
    class="b3-list b3-list--background"
    data-url={root.path}
>
    <Node
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
        {...root}
    />
</ul>

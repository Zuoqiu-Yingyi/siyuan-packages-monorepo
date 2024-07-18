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
    import Root from "./Root.svelte";

    import type { IFileTreeRootNode } from ".";

    export let roots: IFileTreeRootNode[] = [];
</script>

<div class="fn__flex-1 file-tree">
    {#each roots as root (root.path)}
        <Root
            {root}
            on:open
            on:menu
            on:fold
            on:unfold
            on:dragstart
            on:dragend
            on:dragenter
            on:dragover
            on:dragleave
            on:drop
        />
    {/each}
</div>

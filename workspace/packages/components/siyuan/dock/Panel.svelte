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

    export interface ISlots {
        children?: Snippet; // 面板内容
    }

    export type TProps = ISlots;
</script>

<script lang="ts">
    const { children }: TProps = $props();
</script>

<div class="fn__flex-1 fn__flex-column">
    {@render children?.()}
</div>

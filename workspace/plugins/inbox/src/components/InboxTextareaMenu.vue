<!--
 Copyright (C) 2024 Zuoqiu Yingyi
 
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

<!-- 消息输入框菜单 -->
<script setup lang="ts">
import { Dropdown, Dgroup, Doption } from "@arco-design/web-vue";
import { IconCamera, IconVideoCamera, IconImage, IconUser } from "@arco-design/web-vue/es/icon";
</script>

<template>
    <!-- REF: https://arco.design/vue/component/dropdown -->
    <Dropdown trigger="hover">
        <svg
            id="vac-icon-textarea-action"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            version="1.1"
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
        </svg>
        <template #content>
            <Dgroup>
                <template #title>
                    <IconCamera />
                    {{ $t("actions.textarea.photo.title") }}
                </template>
                <Doption>
                    {{ $t("actions.textarea.photo.front") }}
                    <template #icon>
                        <IconUser />
                    </template>
                </Doption>
                <Doption>
                    {{ $t("actions.textarea.photo.rear") }}
                    <template #icon>
                        <IconImage />
                    </template>
                </Doption>
            </Dgroup>
            <Dgroup>
                <template #title>
                    <IconVideoCamera />
                    {{ $t("actions.textarea.video.title") }}
                </template>
                <Doption>
                    {{ $t("actions.textarea.video.front") }}
                    <template #icon>
                        <IconUser />
                    </template>
                </Doption>
                <Doption>
                    {{ $t("actions.textarea.video.rear") }}
                    <template #icon>
                        <IconImage />
                    </template>
                </Doption>
            </Dgroup>
        </template>
    </Dropdown>
</template>

<style scoped lang="less">
#vac-icon-textarea-action {
    path {
        fill: var(--chat-icon-color-menu);
    }
}
</style>

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

<!-- 设置菜单 -->
<script setup lang="ts">
import { Dropdown, Dgroup, Doption } from "@arco-design/web-vue";

import { MenuAction } from "@/messages";

const emits = defineEmits<{
    click: [action: MenuAction]; // 文件列表
}>();
</script>

<template>
    <!-- REF: https://arco.design/vue/component/dropdown -->
    <Dropdown trigger="hover">
        <IconMenu />
        <template #content>
            <!-- 群组 -->
            <Dgroup>
                <template #title>
                    <IconUserGroup />
                    <span class="group-title">{{ $t("actions.menu.room.title") }}</span>
                </template>
                <Doption @click="e => emits('click', MenuAction.ADD_ROOM)">
                    {{ $t("actions.menu.room.add") }}
                    <template #icon>
                        <IconPlus />
                    </template>
                </Doption>
                <Doption @click="e => emits('click', MenuAction.SHOW_ALL_ROOMS)">
                    {{ $t("actions.menu.room.show") }}
                    <template #icon>
                        <IconEye />
                    </template>
                </Doption>
                <Doption @click="e => emits('click', MenuAction.HIDE_UNJOINED_ROOMS)">
                    {{ $t("actions.menu.room.hide") }}
                    <template #icon>
                        <IconEyeInvisible />
                    </template>
                </Doption>
            </Dgroup>

            <!-- 用户 -->
            <Dgroup>
                <template #title>
                    <IconApps />
                    <span class="group-title">{{ $t("actions.menu.user.title") }}</span>
                </template>
                <Doption @click="e => emits('click', MenuAction.DELETE_USER)">
                    {{ $t("actions.menu.user.delete") }}
                    <template #icon>
                        <IconCloseCircle />
                    </template>
                </Doption>
            </Dgroup>

            <!-- 应用 -->
            <Dgroup>
                <template #title>
                    <IconApps />
                    <span class="group-title">{{ $t("actions.menu.app.title") }}</span>
                </template>
                <Doption @click="e => emits('click', MenuAction.LOGOUT)">
                    {{ $t("actions.menu.app.logout") }}
                    <template #icon>
                        <IconCloseCircle />
                    </template>
                </Doption>
                <Doption @click="e => emits('click', MenuAction.RESET)">
                    {{ $t("actions.menu.app.reset") }}
                    <template #icon>
                        <IconRefresh />
                    </template>
                </Doption>
            </Dgroup>
        </template>
    </Dropdown>
</template>

<style scoped lang="less">
.group-title {
    margin-left: 0.5em;
}
</style>

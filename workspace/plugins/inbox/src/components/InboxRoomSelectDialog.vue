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
<!-- 聊天室选择对话框 -->

<script setup lang="ts">
import {
    Avatar,
    Checkbox,
    CheckboxGroup,
    List,
    ListItem,
    ListItemMeta,
    Modal,
} from "@arco-design/web-vue";
import { shallowRef } from "vue";

import type { Room } from "vue-advanced-chat";

interface IProps {
    room: Room; // 当前聊天室
    rooms: Room[]; // 当前用户所在的所有聊天室
}

// eslint-disable-next-line ts/consistent-type-definitions
type TEmits = {
    confirm: [roomIds: string[]]; // 确认按钮
};

const props = defineProps<IProps>();
const emits = defineEmits<TEmits>();
const visible = defineModel<boolean>("visible");
const roomIds = shallowRef<string[]>([]);

/**
 * 点击取消按钮的回调函数
 */
function onCancel(_e: Event): void {
    visible.value = false;
}

/**
 * 点击确认按钮的回调函数
 */
function onOk(_e: Event): void {
    /* 派发群组选择事件 */
    emits("confirm", roomIds.value);
    visible.value = false;
}
</script>

<template>
    <!-- REF: https://arco.design/vue/component/modal -->
    <Modal
        v-model:visible="visible"
        :title="$t('dialog.roomSelect.title')"
        :fullscreen="true"
        @cancel="onCancel"
        @ok="onOk"
    >
        <CheckboxGroup
            v-model="roomIds"
            class="checkbox-group"
        >
            <List
                :data="rooms"
                size="small"
            >
                <ListItem
                    v-for="r in props.rooms"
                    :key="r.roomId"
                    class="list-item"
                >
                    <Checkbox
                        :value="r.roomId"
                        :disabled="r.roomId === room.roomId"
                        class="checkbox"
                    >
                        <ListItemMeta
                            :title="r.roomName"
                            :description="r.roomId"
                        >
                            <template #avatar>
                                <Avatar :image-url="r.avatar" />
                            </template>
                        </ListItemMeta>
                    </Checkbox>
                </ListItem>
            </List>
        </CheckboxGroup>
    </Modal>
</template>

<style scoped lang="less">
.checkbox-group {
    &,
    .checkbox {
        width: 100%;
    }
}
.checkbox {
    padding: 0.5em;

    &.arco-checkbox-checked {
        background-color: var(--color-primary-light-1);
    }
}

.list-item {
    padding: 0 !important;
}
</style>

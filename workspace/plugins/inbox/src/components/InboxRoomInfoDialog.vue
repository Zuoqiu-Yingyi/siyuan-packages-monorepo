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
<!-- 聊天室信息对话框 -->

<script setup lang="ts">
import { computed, shallowRef, watchPostEffect } from "vue";
import { Modal, Form, FormItem, Input, Select } from "@arco-design/web-vue";
import InboxAvatarInput from "./InboxAvatarInput.vue";
import InboxAvatarGroup from "./InboxAvatarGroup.vue";

import type { Room, RoomUser } from "vue-advanced-chat";

interface IProps {
    main: Room; // 主聊天室
    room: Room; // 当前聊天室
    user: RoomUser; // 当前用户
    users: RoomUser[]; // 所有用户
}

type TEmits = {
    confirm: [room: Room]; // 确认按钮
};

const visible = defineModel<boolean>("visible");
const props = defineProps<IProps>();
const emits = defineEmits<TEmits>();

const roomId = shallowRef<string>(""); // 当前聊天室 ID
const avatar = shallowRef<string>(""); // 当前聊天室图标
const roomName = shallowRef<string>(""); // 当前聊天室名称
const users = shallowRef<string[]>([]); // 当前聊天室成员 ID 列表
const usersOptions = computed(() =>
    props.users.map(user => ({
        ...user,
        disabled: user._id === props.user._id,
    })),
); // 所有用户列表
const avatars = computed(() => users.value.map(id => props.users.find(user => user._id === id)?.avatar));

watchPostEffect(() => {
    roomId.value = props.room.roomId;
    avatar.value = props.room.avatar;
    roomName.value = props.room.roomName;
    users.value = props.room.users.map(user => user._id);
});

/**
 * 点击取消按钮的回调函数
 */
function onCancel(e: Event): void {
    visible.value = false;
}

/**
 * 点击确认按钮的回调函数
 */
function onOk(e: Event): void {
    /* 派发聊天室信息更新事件 */
    emits("confirm", {
        ...props.room,
        avatar: avatar.value,
        roomName: roomName.value,
        users: users.value.map(userId => props.users.find(user => user._id === userId)!).filter(user => !!user),
    });

    visible.value = false;
}
</script>

<template>
    <!-- REF: https://arco.design/vue/component/modal -->
    <Modal
        v-model:visible="visible"
        :title="$t('dialog.room.title')"
        :fullscreen="true"
        @cancel="onCancel"
        @ok="onOk"
    >
        <Form
            :model="{}"
            :auto-label-width="true"
            size="medium"
        >
            <!-- 聊天室 ID -->
            <FormItem :label="$t('dialog.room.id.label')">
                <Input
                    :readonly="true"
                    v-model="roomId"
                />
            </FormItem>
            <!-- 聊天室图标 -->
            <FormItem :label="$t('dialog.room.avatar.label')">
                <InboxAvatarInput v-model:avatar="avatar" />
            </FormItem>
            <!-- 聊天室名称 -->
            <FormItem :label="$t('dialog.room.name.label')">
                <Input
                    v-model="roomName"
                    :allow-clear="true"
                />
            </FormItem>
            <!-- 聊天室用户 -->
            <FormItem :label="$t('dialog.room.users.label')">
                <Select
                    v-model:model-value="users"
                    :disabled="props.main.roomId === props.room.roomId"
                    :options="usersOptions"
                    :field-names="{
                        value: '_id',
                        label: 'username',
                    }"
                    :multiple="true"
                />
                <template #extra>
                    <!-- 用户头像列表 -->
                    <InboxAvatarGroup :avatars="avatars" />
                </template>
            </FormItem>
        </Form>
    </Modal>
</template>

<style scoped lang="less"></style>

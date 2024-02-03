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
<!-- 用户信息对话框 -->

<script setup lang="ts">
import { shallowRef, watch } from "vue";
import { Modal, Form, FormItem, Input } from "@arco-design/web-vue";
import InboxAvatarInput from "./InboxAvatarInput.vue";

import type { Room, RoomUser } from "vue-advanced-chat";

interface IProps {
    room: Room; // 当前聊天室
    user: RoomUser; // 当前聊天室用户
}

type TEmits = {
    confirm: [room: Room, user: RoomUser]; // 确认按钮
};

const visible = defineModel<boolean>("visible");
const props = defineProps<IProps>();
const emits = defineEmits<TEmits>();

const userId = shallowRef<string>("");
const avatar = shallowRef<string>("");
const username = shallowRef<string>("");

watch(
    () => props.user,
    user => {
        userId.value = user._id;
        avatar.value = user.avatar;
        username.value = user.username;
    },
    {
        immediate: true,
    },
);

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
    /* 派发用户信息更新事件 */
    emits("confirm", props.room, {
        ...props.user,
        avatar: avatar.value,
        username: username.value,
    });
    visible.value = false;
}
</script>

<template>
    <!-- REF: https://arco.design/vue/component/modal -->
    <Modal
        v-model:visible="visible"
        :title="$t('dialog.user.title')"
        :fullscreen="true"
        @cancel="onCancel"
        @ok="onOk"
    >
        <Form
            :model="{}"
            :auto-label-width="true"
            size="medium"
        >
            <!-- 用户 ID -->
            <FormItem :label="$t('dialog.user.id.label')">
                <Input
                    :readonly="true"
                    v-model="userId"
                />
            </FormItem>
            <!-- 用户头像 -->
            <FormItem :label="$t('dialog.user.avatar.label')">
                <InboxAvatarInput v-model:avatar="avatar" />
            </FormItem>
            <!-- 用户昵称 -->
            <FormItem :label="$t('dialog.user.name.label')">
                <Input
                    v-model="username"
                    :allow-clear="true"
                />
            </FormItem>
        </Form>
    </Modal>
</template>

<style scoped lang="less"></style>

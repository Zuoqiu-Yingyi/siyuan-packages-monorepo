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
import {} from "vue";
import { Modal, Form, FormItem } from "@arco-design/web-vue";
import InboxAvatarInput from "./InboxAvatarInput.vue";
import type { Room } from "vue-advanced-chat";
import { reactive } from "vue";

interface IProps {
    room: Room;
}

interface IEmits extends /* @vue-ignore */ Record<string, any[]> {
    update: [room: Room]; // 更新聊天室信息
}

const visible = defineModel<boolean>("visible");
const props = defineProps<IProps>();
const emits = defineEmits<IEmits>();

const room = reactive<Room>(props.room);

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
    // TODO: 保存聊天室信息
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
            <!-- 聊天室图标 -->
            <FormItem :label="$t('dialog.room.avatar.label')">
                <InboxAvatarInput v-model:avatar="props.room.avatar" />
            </FormItem>
            <!-- 聊天室名称 -->
            <FormItem :label="$t('dialog.room.name.label')"> </FormItem>
            <!-- 聊天室用户 -->
            <FormItem :label="$t('dialog.room.users.label')"> </FormItem>
        </Form>
    </Modal>
</template>

<style scoped lang="less"></style>

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

<script setup lang="ts">
import { inject, shallowRef, reactive, watch, onMounted } from "vue";
import { register, type VueAdvancedChat, type RoomUser, type Room, type Message, type Props } from "vue-advanced-chat";

import { FLAG_LIGHT, MEDIA_QUERY_LIST } from "@workspace/utils/env/native-front-end";
import ArcoConfigProvider from "@workspace/components/arco/ArcoConfigProvider.vue";

import InboxRoomInfoDialog from "@/components/InboxRoomInfoDialog.vue";
import InboxUserInfoDialog from "@/components/InboxUserInfoDialog.vue";
import InboxRoomSelectDialog from "@/components/InboxRoomSelectDialog.vue";
import InboxMenu from "@/components/InboxMenu.vue";
import InboxTextareaMenu from "@/components/InboxTextareaMenu.vue";

import * as Constants from "@/constant";
import { Control } from "@/messages/control";

import type { I18n, VueI18nTranslation } from "vue-i18n";
import type { Logger } from "@workspace/utils/logger";
import type { Client } from "@siyuan-community/siyuan-sdk";
import { deepClone } from "@workspace/utils/misc/clone";

register();
const vue_advanced_chat = shallowRef<HTMLElement | null>(null);

const user = inject("user") as RoomUser;
const i18n = inject("i18n") as I18n;
const locale = inject("locale") as string;
const logger = inject("logger") as Logger;
const client = inject("client") as Client;
const t = i18n.global.t as VueI18nTranslation;

/* emoji-picker-element-data 表情 emoji 数据语言标记 */
const picker_locale: string = (() => {
    switch (locale.toLowerCase()) {
        case "zh":
        case "zh-hans":
            return "zh";
        case "zh-hant":
            return "zh-hant";
        default:
            const language = globalThis.navigator.language.toLowerCase();
            for (const lang of ["bn", "da", "de", "en", "en-gb", "es", "es-mx", "et", "fi", "fr", "hi", "hu", "it", "ja", "ko", "lt", "ms", "nb", "nl", "pl", "pt", "ru", "sv", "th", "uk", "zh", "zh-hant"].reverse()) {
                if (language.startsWith(lang)) {
                    return lang;
                }
            }
            return "en";
    }
})();

/* Arco Design 本地化语言标记 */

const emoji_data_source: string = globalThis.isSecureContext ? `./../libs/emoji-picker-element-data/${locale}/cldr/data.json` : `https://fastly.jsdelivr.net/npm/emoji-picker-element-data/${picker_locale}/cldr/data.json`; // 表情数据源, 非安全上下文中需要校验 ETag
const text_messages = {
    // 界面文本本地化
    CANCEL_SELECT_MESSAGE: t("CANCEL_SELECT_MESSAGE"),
    CONVERSATION_STARTED: t("CONVERSATION_STARTED"),
    IS_ONLINE: t("IS_ONLINE"),
    IS_TYPING: t("IS_TYPING"),
    LAST_SEEN: t("LAST_SEEN"),
    MESSAGES_EMPTY: t("MESSAGES_EMPTY"),
    MESSAGE_DELETED: t("MESSAGE_DELETED"),
    NEW_MESSAGES: t("NEW_MESSAGES"),
    ROOMS_EMPTY: t("ROOMS_EMPTY"),
    ROOM_EMPTY: t("ROOM_EMPTY"),
    SEARCH: t("SEARCH"),
    TYPE_MESSAGE: t("TYPE_MESSAGE"),
};
const text_formatting: Props["text-formatting"] = {
    // disabled: false,
    // italic: "_",
    // bold: "**",
    // strike: "~~",
    // underline: "°",
    // inlineCode: "`",
    // multilineCode: "```",
}; // 富文本标志符号 (该参数无效, 无法覆盖原配置)
const link_options: Props["link-options"] = {
    // disabled: false,
    // REF: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a#target
    // target: "_blank",
    // rel: null,
}; // 超链接打开方式 (该参数无效, 默认配置也无效)
const room_actions: Props["room-actions"] = [
    {
        // 群组设置
        name: "room-settings",
        title: t("actions.room.settings"),
    },
    {
        // 退出群组
        name: "room-leave",
        title: t("actions.room.leave"),
    },
    {
        // 解散群组
        name: "room-disband",
        title: t("actions.room.disband"),
    },
]; // 聊天室下拉菜单 (派遣 room-action-handler 事件)
const menu_actions: Props["menu-actions"] = [
    {
        // 用户设置
        name: "menu-user-settings",
        title: t("actions.menu.userSettings"),
    },
    {
        // 刷新
        name: "menu-reload-messages",
        title: t("actions.menu.reloadMessages"),
    },
    {
        // 清空所有消息
        name: "menu-clear-messages",
        title: t("actions.menu.clearMessages"),
    },
]; // 聊天面板菜单 (派遣 menu-action-handler 事件)
const message_actions: Props["message-actions"] = [
    {
        // 复制消息
        name: "message-copy",
        title: t("actions.message.copy"),
    },
    {
        // 转发消息
        name: "message-forward",
        title: t("actions.message.forward"),
    },
    {
        // 选择消息 (内部处理)
        name: "selectMessages",
        title: t("actions.message.select"),
    },
    {
        // 回复消息 (内部处理)
        name: "replyMessage",
        title: t("actions.message.reply"),
    },
    {
        // 编辑消息 (内部处理)
        name: "editMessage",
        title: t("actions.message.edit"),
        onlyMe: true,
    },
    {
        // 删除消息 (派遣 delete-message 事件)
        name: "deleteMessage",
        title: t("actions.message.delete"),
        onlyMe: true,
    },
]; // 消息菜单 (派遣 message-action-handler 事件)
const message_selection_actions: Props["message-selection-actions"] = [
    {
        // 复制消息
        name: "messages-copy",
        title: t("actions.messages.copy"),
    },
    {
        // 转发消息
        name: "messages-forward",
        title: t("actions.messages.forward"),
    },
]; // 多选消息菜单 (派遣 message-selection-action-handler 事件)
const room_info_enabled: Props["room-info-enabled"] = true; // 是否启用房间信息
const textarea_action_enabled: Props["textarea-action-enabled"] = true; // 是否启用文本框更多操作按钮
const capture_files: Props["capture-files"] = "environment"; // 启用哪个摄像头 (environment: 后摄; user: 前摄)
const custom_search_room_enabled: boolean = false; // 是否使用自定义方案进行搜索聊天室

const username_options: Props["username-options"] = {
    minUsers: 2, // 聊天室中用户数 >= minUsers 时显示用户昵称
    currentUser: true, // 是否显示当前用户昵称
}; // 用户昵称显示选项

const main = reactive<Room>({
    roomId: Constants.MAIN_ROOM_ID,
    roomName: t("inbox"),
    avatar: Constants.ICON_FILE_PATH,
    users: [deepClone()(user)],
    index: 0,
}); // 主收集箱
const theme = shallowRef<"light" | "dark">(FLAG_LIGHT ? "light" : "dark"); // 主题
const roomId = shallowRef<string | null>(null); // 当前聊天室 ID
const rooms = shallowRef<Room[]>([]); // 当前用户所在的聊天室列表
const roomsLoaded = shallowRef<boolean>(false); // 聊天室列表是否加载完成
const messages = shallowRef<Message[]>([]); // 当前聊天室消息列表
const messagesLoaded = shallowRef<boolean>(false); // 当前聊天室消息列表是否加载完成

const currentRoom = shallowRef<Room>(main); // 当前聊天室
const currentRoomUser = shallowRef<RoomUser>(user); // 当前聊天室用户

const roomInfoDialogVisible = shallowRef<boolean>(false); // 是否显示聊天室信息对话框
const roomSelectDialogVisible = shallowRef<boolean>(false); // 是否显示聊天室选择对话框
const roomUserInfoDialogVisible = shallowRef<boolean>(false); // 是否显示用户信息对话框

const control = new Control(
    t, //
    client, //
    logger, //
    user, //
    main, //

    rooms, //
    messages, //
    roomId, //
    currentRoom, //
    currentRoomUser, //

    roomInfoDialogVisible, //
    roomSelectDialogVisible, //
    roomUserInfoDialogVisible, //
);

/* 监听系统主题更改 */
MEDIA_QUERY_LIST.light.addEventListener("change", e => {
    theme.value = e.matches ? "light" : "dark";
});

watch(
    theme,
    () => {
        /* 设置 Arco 主题 */
        globalThis.document.body.setAttribute("arco-theme", theme.value);
    },
    { immediate: true },
);

watch(rooms, () => {
    roomsLoaded.value = true;
});

watch(messages, messages => {
    if (messages.length > 0) {
        messagesLoaded.value = true;
    } else {
        /* 避免无消息时一直处于加载状态 */
        messagesLoaded.value = false;

        setTimeout(() => {
            messagesLoaded.value = true;
        }, 250);
    }
});

onMounted(async () => {
    await control.init();
    await control.online();
    // logger.debug(vue_advanced_chat.value);
});

/**
 * 选择文件列表
 * @param files 文件列表
 */
function onSelectFiles(files: FileList | null): void {
    // logger.debug(files);

    if (files?.length) {
        const vac_col_messages = vue_advanced_chat.value?.shadowRoot?.querySelector(".vac-col-messages");
        if (vac_col_messages) {
            const dataTransfer = new DataTransfer();
            for (const file of files) {
                dataTransfer.items.add(file);
            }

            // 向 .vac-col-messages 元素派遣拖拽文件 drap 事件以将文件添加到消息输入框中
            vac_col_messages.dispatchEvent(new DragEvent("drop", { dataTransfer }));
        }
    }
}
</script>

<template>
    <ArcoConfigProvider :locale="locale" />
    <InboxRoomInfoDialog
        v-model:visible="roomInfoDialogVisible"
        :main="main"
        :room="currentRoom"
        :user="currentRoomUser"
        :users="main.users"
        @confirm="control.onRoomInfoConfirm"
    />
    <InboxUserInfoDialog
        v-model:visible="roomUserInfoDialogVisible"
        :room="currentRoom"
        :user="currentRoomUser"
        @confirm="control.onUserInfoConfirm"
    />
    <InboxRoomSelectDialog
        v-model:visible="roomSelectDialogVisible"
        :room="currentRoom"
        :rooms="rooms"
        @confirm="control.onRoomSelectConfirm"
    />
    <vue-advanced-chat
        ref="vue_advanced_chat"
        height="100vh"
        :room-id="roomId"
        :rooms-loaded="roomsLoaded"
        :messages-loaded="messagesLoaded"
        :theme="theme"
        :current-user-id="user._id"
        :emoji-data-source="emoji_data_source"
        :room-info-enabled="room_info_enabled"
        :textarea-action-enabled="textarea_action_enabled"
        :capture-files="capture_files"
        :custom-search-room-enabled="custom_search_room_enabled"
        :rooms.prop="rooms"
        :messages.prop="messages"
        :text-messages.prop="{
            /* REF: https://cn.vuejs.org/guide/extras/web-components.html#passing-dom-properties */
            ...text_messages,
        }"
        :username-options.prop="username_options"
        :text-formatting.prop="text_formatting"
        :link-options.prop="link_options"
        :room-actions.prop="room_actions"
        :menu-actions.prop="menu_actions"
        :message-actions.prop="message_actions"
        :message-selection-actions.prop="message_selection_actions"
        @fetch-more-rooms="control.handler"
        @toggle-rooms-list="control.handler"
        @add-room="control.handler"
        @search-room="control.handler"
        @room-action-handler="control.handler"
        @room-info="control.handler"
        @fetch-messages="control.handler"
        @send-message="control.handler"
        @edit-message="control.handler"
        @delete-message="control.handler"
        @open-file="control.handler"
        @open-user-tag="control.handler"
        @open-failed-message="control.handler"
        @menu-action-handler="control.handler"
        @message-action-handler="control.handler"
        @message-selection-action-handler="control.handler"
        @send-message-reaction="control.handler"
        @textarea-action-handler="control.handler"
        @typing-message="control.handler"
    >
        <!-- 自定义添加按钮 -->
        <span
            class="icon"
            slot="add-icon"
        >
            <InboxMenu @click="control.onClickMenuItem" />
        </span>
        <!-- 消息输入框的自定义按钮, 点击时触发 textarea-action-handler 事件 -->
        <span
            class="icon"
            slot="custom-action-icon"
        >
            <InboxTextareaMenu @files="onSelectFiles" />
        </span>
    </vue-advanced-chat>
</template>

<style scoped lang="less"></style>

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
import { inject, shallowRef, onMounted } from "vue";
import type { I18n, VueI18nTranslation } from "vue-i18n";
import { register, type VueAdvancedChat, type RoomUser, type Room, type Message, type Props } from "vue-advanced-chat";

import type { Logger } from "@workspace/utils/logger";
import type { Client } from "@siyuan-community/siyuan-sdk";

import { Control } from "@/messages/control";
import * as Constants from "@/constant";

register();

const user = inject("user") as RoomUser;
const i18n = inject("i18n") as I18n;
const theme = inject("theme") as "dark" | "light";
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
            for (const lang of [
                "bn",
                "da",
                "de",
                "en",
                "en-gb",
                "es",
                "es-mx",
                "et",
                "fi",
                "fr",
                "hi",
                "hu",
                "it",
                "ja",
                "ko",
                "lt",
                "ms",
                "nb",
                "nl",
                "pl",
                "pt",
                "ru",
                "sv",
                "th",
                "uk",
                "zh",
                "zh-hant",
            ].reverse()) {
                if (language.startsWith(lang)) {
                    return lang;
                }
            }
            return "en";
    }
})();

const emoji_data_source: string = globalThis.isSecureContext
    ? `./../libs/emoji-picker-element-data/${locale}/cldr/data.json`
    : `https://fastly.jsdelivr.net/npm/emoji-picker-element-data/${picker_locale}/cldr/data.json`; // 表情数据源, 非安全上下文中需要校验 ETag
const text_messages = { // 界面文本本地化
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
const room_info_enabled: Props["room-info-enabled"] = true; // 是否启用房间信息
const textarea_action_enabled: Props["textarea-action-enabled"] = true; // 是否启用文本框更多操作按钮
const capture_files: Props["capture-files"] = "environment"; // 启用哪个摄像头 (environment: 后摄; user: 前摄)
const custom_search_room_enabled: boolean = false; // 是否使用自定义方案进行搜索聊天室

const username_options: Props["username-options"] = {
    minUsers: 2, // 聊天室中用户数 >= minUsers 时显示用户昵称
    currentUser: true, // 是否显示当前用户昵称
}; // 用户昵称显示选项

const roomId = shallowRef<string | null>(null);
const rooms = shallowRef<Room[]>([]);
const roomsLoaded = shallowRef<boolean>(false);
const messages = shallowRef<Message[]>([]);
const messagesLoaded = shallowRef<boolean>(false);

const control = new Control(t, client, logger, user, roomId, rooms, roomsLoaded, messages, messagesLoaded);
onMounted(async () => {
    await control.init();
    control.online();
});
</script>

<template>
    <vue-advanced-chat
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
    />
</template>

<style scoped lang="less"></style>

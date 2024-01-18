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
import { register, type VueAdvancedChat, type RoomUser, type Room, type Message } from "vue-advanced-chat";

import type { Logger } from "@workspace/utils/logger";
import type { Client } from "@siyuan-community/siyuan-sdk";

import { Control } from "@/messages/control";

register();

const user = inject("user") as RoomUser;
const i18n = inject("i18n") as I18n;
const theme = inject("theme") as "dark" | "light";
const locale = inject("locale") as string;
const logger = inject("logger") as Logger;
const client = inject("client") as Client;
const t = i18n.global.t as VueI18nTranslation;

const emoji_data_source = `./../libs/emoji-picker-element-data/${locale}/cldr/data.json`; // 表情数据源
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

const rooms = shallowRef<Room[]>([]);
const messages = shallowRef<Message[]>([]);
const roomsLoaded = shallowRef<boolean>(false);
const messagesLoaded = shallowRef<boolean>(false);

const control = new Control(t, client, logger, user, rooms, roomsLoaded, messages, messagesLoaded);
onMounted(async () => {
    await control.init();
    control.online();
});
</script>

<template>
    <vue-advanced-chat
        height="100vh"
        :current-user-id="user._id"
        :rooms-loaded="roomsLoaded"
        :messages-loaded="messagesLoaded"
        :theme="theme"
        :emoji-data-source="emoji_data_source"

        :rooms.prop="rooms"
        :messages.prop="messages"
        :text-messages.prop="{
            /* REF: https://cn.vuejs.org/guide/extras/web-components.html#passing-dom-properties */
            ...text_messages,
        }"

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

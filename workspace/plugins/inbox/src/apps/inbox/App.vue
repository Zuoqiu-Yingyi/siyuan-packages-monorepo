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
import { inject } from "vue";
import type { I18n, VueI18nTranslation } from "vue-i18n";
import { register } from "vue-advanced-chat";

import type { Client } from "@siyuan-community/siyuan-sdk";

register();

const i18n = inject("i18n") as I18n;
const theme = inject("theme") as string;
const locale = inject("locale") as string;
const client = inject("client") as Client;
const t = i18n.global.t as VueI18nTranslation;

const emoji_data_source = `./../libs/emoji-picker-element-data/${locale}/cldr/data.json`;
const text_messages = {
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
</script>

<template>
    <vue-advanced-chat
        height="100vh"
        :current-user-id="'user-id'"
        :rooms="[]"
        :messages="[]"
        :theme="theme"
        :emoji-data-source="emoji_data_source"
        :text-messages.prop="{
            /* REF: https://cn.vuejs.org/guide/extras/web-components.html#passing-dom-properties */
            ...text_messages,
        }"
    />
</template>

<style scoped lang="less">
</style>

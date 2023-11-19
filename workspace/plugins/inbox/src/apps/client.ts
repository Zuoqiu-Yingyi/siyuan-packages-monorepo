/**
 * Copyright (C) 2023 Zuoqiu Yingyi
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { createApp } from "vue";
import { createI18n } from "vue-i18n";

import { Client } from "@siyuan-community/siyuan-sdk";
import { mapLang } from "@workspace/utils/locale/language";
import { trimSuffix } from "@workspace/utils/misc/string";

import manifest from "~/public/plugin.json";
import APP from "./Client.vue";

/* 语言包 */
import en from "@/locales/en.json";
import zh_Hans from "@/locales/zh-Hans.json";
import zh_Hant from "@/locales/zh-Hant.json";

const element = globalThis.document.createElement("div");
globalThis.document.body.append(element);

/* 客户端 */
const client = new Client({
    baseURL: trimSuffix(globalThis.location.origin, `plugins/${manifest.name}/apps/client.html`),
});

/* 本地化 */
const locale = mapLang(); // 语言
const fallbackLocale = "en"; // 回退语言

const messages = {
    "en": en,
    "zh-Hans": zh_Hans,
    "zh-Hant": zh_Hant,
};

const i18n = createI18n({
    locale, // set locale
    fallbackLocale, // set fallback locale
    messages,
});

const app = createApp(APP);

/**
 * 启用开发模式的性能分析
 * REF: https://cn.vuejs.org/api/application.html#app-config-performance
 */
app.config.performance = true;

app.use(i18n);

app.provide("i18n", i18n);
app.provide("client", client);

app.mount(element);

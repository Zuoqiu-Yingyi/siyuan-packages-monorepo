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

/* 静态资源 */
import manifest from "~/public/plugin.json";
import "./main.less";

/* 语言包 */
import en from "@/locales/en.json";
import zh_Hans from "@/locales/zh-Hans.json";
import zh_Hant from "@/locales/zh-Hant.json";

import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import type { RoomUser } from "vue-advanced-chat";

import { Client } from "@siyuan-community/siyuan-sdk";
import { mapLang } from "@workspace/utils/locale/language";
import { trimSuffix } from "@workspace/utils/misc/string";
import { UA } from "@workspace/utils/misc/user-agent";
import { auth } from "@workspace/utils/siyuan/url";
import { FLAG_LIGHT } from "@workspace/utils/env/native-front-end";
import { id } from "@workspace/utils/siyuan/id";

import { Logger } from "@workspace/utils/logger";

import App from "./App.vue";
import * as Constants from "~/src/constant";

(async () => {
    /* 主题 */
    const theme = FLAG_LIGHT ? "light" : "dark";

    /* 日志记录器 */
    const logger = new Logger(`plugin-${manifest.name}-app-inbox`);

    /* 申请通知权限 */
    if ("Notification" in globalThis) {
        if (globalThis.Notification.permission !== "granted") {
            globalThis.Notification.requestPermission();
        }
    }

    /* 客户端 */
    const baseURL = trimSuffix(globalThis.location.origin, `plugins/${manifest.name}/apps/client.html`);
    const client = new Client({
        baseURL,
    }, "fetch");

    try {
        /* 验证是否已通过认证 */
        const response = await client.echo({ method: "POST" });
        var ip = response.data.Context.ClientIP || response.data.Context.RemoteIP;
    } catch (error) {
        auth(); // 跳转到认证页面
        return;
    }

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

    globalThis.document.title = i18n.global.t("inbox") as string;

    /* 当前用户信息 */
    const user: RoomUser = (() => {
        try {
            const user_json = globalThis.localStorage.getItem(Constants.STORAGE_USER_NAME);
            if (user_json) {
                const current_user: RoomUser = JSON.parse(user_json);
                current_user.status.state = "online";
                return current_user;
            }
            else {
                throw new Error();
            }
        }
        catch {
            const current_user_id = id();
            const username = [
                UA.os.name,
                UA.browser.name,
                UA.device.vendor,
                // ip,
                current_user_id,
            ].join("-");
            const current_user: RoomUser = {
                _id: current_user_id,
                username,
                avatar: "",
                status: {
                    state: "online",
                    lastChanged: new Date().toISOString(),
                },
            };
            globalThis.localStorage.setItem(Constants.STORAGE_USER_NAME, JSON.stringify(current_user));
            return current_user;
        }
    })();
    // logger.debug(user);

    /* 初始化应用 */
    const app = createApp(App);

    /**
     * 启用开发模式的性能分析
     * REF: https://cn.vuejs.org/api/application.html#app-config-performance
     */
    // app.config.performance = true;

    app.use(i18n);

    app.provide("user", user);
    app.provide("i18n", i18n);
    app.provide("theme", theme);
    app.provide("locale", locale);
    app.provide("logger", logger);
    app.provide("client", client);

    const root = globalThis.document.createElement("div");
    globalThis.document.body.append(root);
    app.mount(root);
})();

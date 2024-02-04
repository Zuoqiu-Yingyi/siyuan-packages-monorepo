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
import { Modal, Notification } from '@arco-design/web-vue';
import type { RoomUser } from "vue-advanced-chat";

import { Client } from "@siyuan-community/siyuan-sdk";
import { mapLang } from "@workspace/utils/locale/language";
import { trimSuffix } from "@workspace/utils/misc/string";
import { UA } from "@workspace/utils/misc/user-agent";
import { auth } from "@workspace/utils/siyuan/url";
import { id } from "@workspace/utils/siyuan/id";

import { Logger } from "@workspace/utils/logger";

import App from "./App.vue";
import * as Constants from "~/src/constant";

(async () => {
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

    /* 用户默认头像 */
    const avatar = ((browser: string) => {
        switch (true) {
            case browser.includes("chrome"):
                return "./../icons/chrome.svg";
            case browser.includes("chromium"):
                return "./../icons/chromium.svg";
            case browser.includes("edge"):
                return "./../icons/edge.svg";
            case browser.includes("electron"):
                return "./../icons/electron.svg";
            case browser.includes("firefox"):
                return "./../icons/firefox.svg";
            case browser.includes("opera"):
                return "./../icons/opera.svg";
            case browser.includes("safari"):
                return "./../icons/safari.svg";
            case browser.includes("uc"):
                return "./../icons/uc.svg";
            case browser.includes("vivaldi"):
                return "./../icons/vivaldi.svg";
            case browser.includes("webkit"):
                return "./../icons/webkit.svg";
            default:
                return "./../icons/siyuan.svg";
        }
    })(String(UA.browser.name).toLowerCase());

    /* 当前用户信息 */
    const user: RoomUser = (() => {
        try {
            const user_json = globalThis.localStorage.getItem(Constants.STORAGE_KEY_USER);
            if (user_json) {
                const current_user: RoomUser = JSON.parse(user_json);
                current_user.status.state = "offline";
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
                UA.device.type,
                // ip,
                current_user_id,
            ].filter(s => !!s).join("-");
            const current_user: RoomUser = {
                _id: current_user_id,
                username,
                avatar,
                status: {
                    state: "offline",
                    lastChanged: new Date().toISOString(),
                },
            };
            globalThis.localStorage.setItem(Constants.STORAGE_KEY_USER, JSON.stringify(current_user));
            return current_user;
        }
    })();
    logger.debug(user);

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
    app.provide("locale", locale);
    app.provide("logger", logger);
    app.provide("client", client);

    /**
     * 设置全局组件上下文
     * REF: https://arco.design/vue/component/modal
     * REF: https://arco.design/vue/component/notification
     */
    Modal._context = app._context;
    Notification._context = app._context;

    const root = globalThis.document.createElement("div");
    globalThis.document.body.append(root);
    app.mount(root);
})();

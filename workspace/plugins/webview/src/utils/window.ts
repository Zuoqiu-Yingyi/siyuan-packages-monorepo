// Copyright (C) 2023 Zuoqiu Yingyi
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/* 打开新窗口 */

import { isElectron } from "@workspace/utils/env/front-end";
import { merge } from "@workspace/utils/misc/merge";
import { buildMenuTemplate } from "@workspace/utils/window/menuTemplae";

import type { Electron } from "@workspace/types/electron";

import type WebviewPlugin from "@/index";
import type { IWindowParams } from "@/types/config";

/* 菜单栏状态 */
export enum MenuBarStatus {
    AlwaysShow, // 总是显示
    AutoHide, // 自动隐藏
    Disabled, // 禁用
}

/* 页面配置 */
export interface IWebPreferences extends Electron.WebPreferences {
    defaultFontSize?: number; // 默认字体大小
    defaultFontFamily?: {
        standard?: string; // 默认字体
    };
}

/* 覆写的配置 */
export interface IOverwrite extends Electron.BrowserWindowConstructorOptions {
    x?: number; // 窗口横坐标
    y?: number; // 窗口纵坐标
    title: string; // 窗口标题
    webPreferences?: IWebPreferences; // 页面配置

    enableMenuBar?: boolean; // (自定义) 是否启用菜单栏
    enableElectron?: boolean; // (自定义) 是否启用 Electron 环境
}

export function openNewWindow(
    url: URL, // 窗口地址
    windowParams: IWindowParams, // 窗口参数
    overwriteParams: IOverwrite | IWindowParams, // 覆盖参数
    webPreferences: IWebPreferences, // 页面参数
    plugin: InstanceType<typeof WebviewPlugin>, // 插件对象
): Electron.BrowserWindow | Window | null {
    overwriteParams.webPreferences = merge(overwriteParams.webPreferences || {}, webPreferences) as IWebPreferences;
    const params = merge(windowParams, overwriteParams) as IOverwrite & IWindowParams;

    if (isElectron()) {
        try {
            /* 若窗口需要显示在屏幕中间, 不设置窗口位置 */
            if (params.center) {
                delete params.x;
                delete params.y;
            }

            /* 创建窗口 */
            const {
                BrowserWindow,
                Menu,
            } = globalThis.require("@electron/remote") as {
                BrowserWindow: typeof Electron.BrowserWindow;
                Menu: typeof Electron.Menu;
            };
            const window = new BrowserWindow(params);

            /* 是否启用菜单栏 */
            if (params.enableMenuBar) {
                const menu = Menu.buildFromTemplate(buildMenuTemplate(params.alwaysOnTop));
                window.setMenu(menu);
            }
            else {
                window.removeMenu();
            }

            /* 是否启用 Electron 环境 */
            if (params.enableElectron) {
                globalThis
                    .require("@electron/remote")
                    .require("@electron/remote/main")
                    .enable(window.webContents);
            }

            /* 加载 URL */
            window.loadURL(
                url.href,
                {
                    userAgent: plugin.useragent,
                },
            );

            return window;
        }
        catch (err) {
            plugin.logger.warn(err);
            return null;
        }
    }
    else {
        /* 若窗口需要显示在屏幕中间, 计算窗口位置 */
        if (params.center) {
            params.x = (globalThis.screen.width - params.width) / 2;
            params.y = (globalThis.screen.height - params.height) / 2;
        }
        // console.debug(globalThis.screen, params);

        return globalThis.open(
            url.href,
            url.href,
            [
                `popup = true`,
                `width = ${params.width}`,
                `height = ${params.height}`,
                `left = ${params.x}`,
                `top = ${params.y}`,
            ].join(", "),
        );
    }
}

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

import { FLAG_ELECTRON } from "./../env/native-front-end";
import { buildMenuTemplate } from "./menuTemplae";

import type { Electron } from "@workspace/types/electron";

export interface IOpenWindowOptins {
    url: string | URL; // 窗口目标地址
    base: IOpenWindowBaseOptions;
    extra?: IOpenWindowExtraOptions;
}

export interface IOpenWindowBaseOptions extends Electron.BrowserWindowConstructorOptions {
    width?: number; // 窗口宽度/高度
    height?: number; // 窗口宽度/高度

    x?: number; // 窗口横坐标
    y?: number; // 窗口纵坐标
    center?: boolean; // 窗口是否居中显示
    alwaysOnTop?: boolean; // 窗口是否置顶
}

export interface IOpenWindowExtraOptions {
    /* 浏览器窗口设置项 */
    target?: string; // 窗口名称
    noopener?: boolean; // 窗口名称
    noreferrer?: boolean; // 窗口名称

    /* Electron 窗口设置项 */
    menu?: Electron.Menu; // 窗口菜单
    enableMenuBar?: boolean; // 是否启用菜单栏
    enableElectron?: boolean; // 新窗口是否启用 Electron 环境
    loadURLOptions?: Electron.LoadURLOptions; // 加载 URL 时的参数
}

/**
 * 在 Electron 新窗口打开 URL
 * @param options - 窗口设置项
 * @returns 窗口对象
 */
export function openBrowserWindow(options: IOpenWindowOptins): Electron.BrowserWindow {
    /* 若窗口需要显示在屏幕中间, 不设置窗口位置 */
    if (options.base.center) {
        delete options.base.x;
        delete options.base.y;
    }

    /* 创建窗口 */
    const {
        BrowserWindow,
        Menu,
    } = globalThis.require("@electron/remote") as {
        BrowserWindow: typeof Electron.BrowserWindow;
        Menu: typeof Electron.Menu;
    };
    const browser = new BrowserWindow(options.base);

    /* 是否启用菜单栏 */
    if (options.extra?.enableMenuBar) {
        if (options.extra?.menu) {
            browser.setMenu(options.extra.menu);
        }
        else {
            const menu = Menu.buildFromTemplate(buildMenuTemplate(options.base.alwaysOnTop));
            browser.setMenu(menu);
        }
    }
    else {
        browser.removeMenu();
    }

    /* 是否启用 Electron 环境 */
    if (options.extra?.enableElectron) {
        globalThis
            .require("@electron/remote")
            .require("@electron/remote/main")
            .enable(browser.webContents);
    }

    /* 加载 URL */
    browser.loadURL(
        options.url.toString(),
        options.extra?.loadURLOptions,
    );

    return browser;
}

/**
 * 在浏览器新窗口打开 URL
 * @param options - 窗口设置项
 * @returns 窗口对象
 */
export function openPopupWindow(options: IOpenWindowOptins): null | Window {
    if (options.base.center) {
        if (options.base.width) {
            options.base.x = (globalThis.screen.width - options.base.width) / 2;
        }
        if (options.base.height) {
            options.base.y = (globalThis.screen.height - options.base.height) / 2;
        }
    }

    const features: string[] = [
        `popup = true`,
    ];

    (options.base.x !== undefined) && features.push(`left = ${options.base.x}`);
    (options.base.y !== undefined) && features.push(`top = ${options.base.y}`);
    (options.base.width !== undefined) && features.push(`width = ${options.base.width}`);
    (options.base.height !== undefined) && features.push(`height = ${options.base.height}`);
    (options.extra?.noopener !== undefined) && features.push(`noopener = ${options.extra.noopener}`);
    (options.extra?.noreferrer !== undefined) && features.push(`noreferrer = ${options.extra.noreferrer}`);

    const popup = globalThis.open(
        options.url.toString(),
        options.extra?.target,
        features.join(", "),
    );

    return popup;
}

/**
 * 在新窗口打开 URL
 * @param options - 窗口设置项
 * @returns 窗口对象
 */
export function openWindow(options: IOpenWindowOptins): Electron.BrowserWindow | null | Window {
    return FLAG_ELECTRON
        ? openBrowserWindow(options)
        : openPopupWindow(options);
}

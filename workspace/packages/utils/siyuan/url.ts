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

import { BlockID } from "@workspace/types/siyuan";
import { EditorType } from ".";
import regexp from "../regexp";

/* 思源各 web 端路径 */
export enum Pathname {
    window = "/stage/build/app/window.html",
    app = "/stage/build/app",
    desktop = "/stage/build/desktop",
    mobile = "/stage/build/mobile",
}

export function editorType2Pathname(editorEype: EditorType): Pathname {
    switch (editorEype) {
        case EditorType.window:
            return Pathname.window;
        case EditorType.app:
            return Pathname.app;
        case EditorType.desktop:
            return Pathname.desktop;
        case EditorType.mobile:
            return Pathname.mobile;
    }
}

/**
 * @params pathname: web 端路径
 * @params params: URL 查询参数
 * @return: URL
 */
export function buildSiyuanWebURL(pathname: Pathname, params?: { id?: BlockID, focus?: boolean, url?: string }, origin = globalThis.origin): URL {
    const url = new URL(origin);
    url.pathname = pathname;
    if (params?.id) {
        url.searchParams.set("id", params.id);
    }
    if (params?.focus) {
        url.searchParams.set("focus", "1");
    }
    if (params?.url) {
        url.searchParams.set("url", params.url);
    }
    return url;
}

/**
 * 解析思源 URL
 * @params url: URL
 */
export function parseSiyuanURL(url: URL) {
    if (regexp.url.test(url.href)) {
        return {
            id: regexp.url.exec(url.href)![1],
            focus: url.searchParams.get("focus") === "1",
        }
    }
    else { 
        return null;
    }
}
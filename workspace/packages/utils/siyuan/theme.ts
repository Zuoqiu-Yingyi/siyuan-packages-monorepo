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

import type { ISiyuanGlobal } from "@workspace/types/siyuan";
declare var globalThis: ISiyuanGlobal;

/* 是否为暗色主题 */
export function isDarkTheme(): boolean {
    const themeMode = globalThis
        ?.document
        ?.documentElement
        ?.dataset
        ?.themeMode;

    switch (themeMode) {
        case "dark":
            return true;
        case "light":
            return false;
        default:
            break;
    }

    const mode = globalThis
        ?.siyuan
        ?.config
        ?.appearance
        ?.mode;

    switch (mode) {
        case 1:
            return true;
        case 0:
            return false;
        default:
            break;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/* 是否为亮色主题 */
export function isLightTheme(): boolean {
    return !isDarkTheme();
}

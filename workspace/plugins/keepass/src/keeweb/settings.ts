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

// @ts-ignore
import BaseLocale from "util/formatting/string-format";

import { camelCase } from "@workspace/utils/misc/string";

export interface IAppSettings {
    local?: string;
}

export enum LocalStorageKey {
    app_settings = 'app-settings',
    file_info = 'file-info',
    plugin_gallery = 'plugin-gallery',
    plugins = 'plugins',
    runtime_data = 'runtime-data',
    update_info = 'update-info',
}
export function getLocalStorage(key: LocalStorageKey.app_settings): IAppSettings | null;
export function getLocalStorage(key: LocalStorageKey): any | null {
    const value = globalThis.localStorage.getItem(`siyuan-keepass-${key}`)
        ?? globalThis.localStorage.getItem(camelCase(key));

    if (value) {
        return JSON.parse(value);
    }
    else {
        return null;
    }
}

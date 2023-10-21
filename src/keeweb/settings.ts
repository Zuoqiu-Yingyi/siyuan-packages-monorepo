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

/**
 * REF: https://github.com/keeweb/keeweb/blob/develop/plugins/examples/settings/plugin.js
 */
import { camelCase } from "@workspace/utils/misc/string";
import type { IContext } from ".";

export interface IAppSettings {
    locale?: string;
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
    const value = globalThis.localStorage.getItem(`plugin-keepass-${key}`)
        ?? globalThis.localStorage.getItem(camelCase(key));

    if (value) {
        return JSON.parse(value);
    }
    else {
        return null;
    }
}

export function install(context: IContext) {
    // this._logger.debug("plugin:siyuan:settings-install");

    context.settings = [
        {
            name: "baseURL",
            label: context.i18n!.siyuanBaseURL,
            type: "text",
            placeholder: context.baseURL,
            value: "",
        },
        {
            name: "token",
            label: context.i18n!.siyuanToken,
            type: "text",
            placeholder: context.i18n!.siyuanTokenPlaceholder,
            value: "",
        },
        {
            name: "path",
            label: context.i18n!.siyuanPath,
            type: "text",
            placeholder: context.defaultPath,
            value: context.defaultPath,
        },
        {
            name: "fileOpenSchema",
            label: context.i18n!.siyuanFileOpenDefaultPath,
            type: "select",
            options: [
                {
                    value: "path",
                    get label(): string { return `${context.i18n!.siyuanPath} [${context.path}]` },
                },
                {
                    value: "root",
                    get label(): string { return `${context.i18n!.siyuanWorkspaceRootDirectory} [/]` },
                },
            ],
            value: "path",
        },
    ];
}


export function uninstall(context: IContext) {
    // this._logger.debug("plugin:siyuan:settings-install");
}

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

export interface IPluginManifest {
    version: string,
    manifestVersion: string,
    name: string,
    description: string,
    author: {
        name: string,
        email: string,
        url: string,
    },
    license: string,
    url: string,
    resources: {
        js?: string | boolean,
        css?: string | boolean,
        loc?: string | boolean,
    },
    locale?: {
        name: string,
        title: string,
        flag: string,
    },
    publicKey: string,
}

export interface ILocalStoragePlugin {
    manifest: IPluginManifest;
    url: string; // 插件文件请求的 URL
    enabled: boolean; // 是否启用该插件
    autoUpdate: boolean; // 是否自动更新该插件
}

export interface ILocalStoragePlugins {
    autoUpdateDate: null | number;
    autoUpdateAppVersion: null | string;
    plugins: ILocalStoragePlugin[];
}

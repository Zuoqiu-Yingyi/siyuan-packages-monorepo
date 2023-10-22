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

import zh_Hans from "./i18n/zh-Hans.json";
import type sdk from "@siyuan-community/siyuan-sdk";
import type { SiyuanStorage } from "./storage";
import type { IPluginManifest } from "@/types/keeweb";

export type I18N = typeof zh_Hans;

/**
 * 插件设置项
 * 
 * 模板文件: app/templates/settings/settings-plugins.hbs
 */
//#region plugin-setting
export interface IPluginBaseSetting<T> {
    name: string;
    type: string;
    label: string;
    value: T;
}
export interface IPluginTextSetting extends IPluginBaseSetting<string> {
    type: "text";
    maxlength?: number;
    placeholder?: string;
}
export interface IPluginSelectSetting extends IPluginBaseSetting<string> {
    type: "select";
    options: {
        value: string;
        label: string;
    }[];
}
export interface IPluginCheckboxSetting extends IBaseSetting<boolean> {
    type: "checkbox";
}
export type TPluginSetting = ITextSetting
    | ISelectSetting
    | ICheckboxSetting;
//#endregion plugin-setting

/** 
 * 储存打开设置项
 * 
 * 模板文件: app/templates/open-config.hbs
 */
//#region storage-open-config
export interface IStorageOpenConfigField {
    id: string;
    type: string; // input.type
    title: string;
    desc?: string;
    placeholder?: string;
    required?: boolean;
    pattern?: string;
}
export interface IStorageOpenConfig {
    desc?: string;
    fields: IStorageOpenConfigField[];
}
//#region storage-open-config

/**
 * 储存设置项
 * 
 * 模板文件: app/templates/settings/settings-prv.hbs
 */
export interface IStorageBaseSettings<T> {
    id: string;
    type: string;
    title: string;
    value: T;
}
export interface IStorageSelectSetting extends IStorageBaseSettings<string> {
    type: "select";
    options: Record<string, string>;
}
export interface IStorageCheckboxSetting extends IStorageBaseSettings<boolean> {
    type: "checkbox";
    desc?: string;
}
export interface IStorageInputSetting<T> extends IStorageBaseSettings<T> {
    desc?: string;
    required?: boolean;
    pattern?: string;
    placeholder?: string;
}
export type TStorageSttingField<T = string | number> = IStorageInputSetting<T>
    | IStorageCheckboxSetting
    | IStorageSelectSetting;
export interface IStorageSettingsConfig {
    desc?: string;
    fields: TStorageSttingField[];
}

export type TFileOpenSchema = "path" | "root";

export interface IContext {
    path: string;
    type: "fetch";
    client: InstanceType<typeof sdk.Client>;
    baseURL: string;
    manifest: IPluginManifest;
    defaultPath: string; // 默认文件存放目录
    fileOpenPath: string; // 文件打开路径
    storage?: InstanceType<typeof SiyuanStorage>;
    lang?: string;
    i18n?: I18N;
    settings?: TPluginSetting[];
}

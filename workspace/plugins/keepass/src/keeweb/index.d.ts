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

export type I18N = typeof zh_Hans;

export interface IBaseSetting<T> {
    name: string;
    label: string;
    type: string;
    value: T;
}
export interface ITextSetting extends IBaseSetting<string> {
    type: "text";
    maxlength?: number;
    placeholder?: string;
}
export interface ISelectSetting extends IBaseSetting<string> {
    type: "select";
    options: {
        value: string;
        label: string;
    }[];
}
export interface ICheckboxSetting extends IBaseSetting<boolean> {
    type: "checkbox";
}
export type TSetting = ITextSetting
    | ISelectSetting
    | ICheckboxSetting;

export type TFileOpenSchema = "path" | "root";

export interface IContext {
    path: string;
    client: InstanceType<typeof sdk.Client>;
    baseURL: string;
    defaultPath: string; // 默认文件存放目录
    fileOpenPath: string; // 文件打开路径
    storage?: InstanceType<typeof SiyuanStorage>;
    lang?: string;
    i18n?: I18N;
    settings?: TSetting[];
}

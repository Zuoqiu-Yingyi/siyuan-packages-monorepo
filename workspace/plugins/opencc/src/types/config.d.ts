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

import type { Locale } from "@/opencc";

/* 转换设置 */
export interface IConvert {
    from: Locale;
    to: Locale;
    dict: string;
}

export interface IOpenCC {
    dict: string; // 全局字典
    s2t: IConvert; // 简体 → 繁体
    t2s: IConvert; // 繁体 → 简体
    custom: IConvert; // 自定义转换
}

export interface IConfig {
    opencc: IOpenCC;
}

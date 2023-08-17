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

// REF: https://www.npmjs.com/package/opencc-js
import * as opencc from "opencc-js";

export enum Locale {
    cn = "cn",
    t = "t",
    hk = "hk",
    tw = "tw",
    twp = "twp",
    jp = "jp",
}

/* 转换器参数 */
export interface IConverterOptions {
    from: Locale; // 原语言
    to: Locale; // 目标语言
    dict?: opencc.TDict; // 自定义扩展字典
}

/**
 * 从 Locale 构造 opencc 的字典
 * @param locale 地区
 * @param type 字典类型
 */
export function locale2dict(locale: Locale, type: keyof opencc.ILocale): opencc.TDict | undefined {
    const dicts = opencc.Locale[type];
    return dicts[locale];
}

/**
 * 创建转换器
 */
export function createConverter(options: IConverterOptions): opencc.ConvertText {
    const dicts: opencc.TDict[] = [];

    /* 获取字典 */
    const from = locale2dict(options.from, "from");
    const to = locale2dict(options.to, "to");

    from && dicts.push(from);
    to && dicts.push(to);
    options.dict && dicts.push(options.dict);

    const converter = opencc.ConverterFactory(...dicts);
    return converter;
}

/**
 * 构造转换器并进行转换
 * @param text 原文本
 * @param options 转换器参数
 * @return 转换后的文本
 */
export function convert(
    text: string,
    options: IConverterOptions,
): string {
    const converter = createConverter(options);
    return converter(text);
}

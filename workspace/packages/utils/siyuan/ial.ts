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

import { escapeHTML } from "./../misc/html";

/**
 * 创建内联属性表字符串
 * @param ial: 属性表对象
 * @returns IAL token 字符串, 格式： {: key="value" key="value" ...}
 */
export function createIAL(ial: Record<string, string | null>): string {
    let IAL = [];
    for (const [key, value] of Object.entries(ial)) {
        if (value) {
            IAL.push(`${key}="${escapeHTML(value).replaceAll("\n", "_esc_newline_")}"`);
        }
    }
    return `{: ${IAL.join(" ")}}`;
}

/**
 * 创建 style 属性表字符串
 * @param styles 属性表对象
 * @returns 字符串, 格式： style="key: value; key: value; ..."
 */
export function createStyle(styles: Record<string, string>): string {
    let style = [];
    for (const [key, value] of Object.entries(styles)) {
        style.push(`${key}: ${value};`);
    }
    return `${style.join(" ")}`;
}

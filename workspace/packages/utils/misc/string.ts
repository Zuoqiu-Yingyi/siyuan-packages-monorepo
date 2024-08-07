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

/* 移除字符串前缀 */
export function trimPrefix(str: string, prefix: string): string {
    return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

/* 移除字符串后缀 */
export function trimSuffix(str: string, suffix: string): string {
    return str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
}

/**
 * UTF-32 编码
 * @param str - 字符串
 * @returns UTF-32 编码的字符串
 */
export function utf32Encode(str: string): string {
    return str.codePointAt(0)?.toString(16) ?? "";
}

/**
 * UTF-32 解码
 * REF: https://zhuanlan.zhihu.com/p/386511092
 * @param hex - UTF-32 编码的字符串
 * @returns 解码后的字符串
 */
export function utf32Decode(hex: string): string {
    return String.fromCodePoint(Number.parseInt(hex, 16));
}

/**
 * 首字母大写
 * @param str - 字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
    return str
        ? `${str.at(0)?.toUpperCase()}${str.substring(1)}`
        : str;
}

/**
 * 驼峰命名法
 * @param str - 字符串
 * @returns 驼峰命名法的字符串
 */
export function camelCase(str: string): string {
    return str.replace(/-+./g, (match) => match.at(-1)!.toUpperCase());
}

/**
 * 帕斯卡命名法
 * @param str - 字符串
 * @returns 帕斯卡命名法的字符串
 */
export function pascalCase(str: string): string {
    return capitalize(camelCase(str));
}

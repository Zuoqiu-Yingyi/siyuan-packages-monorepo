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

export type EnumKeys<E> = keyof E;
export type EnumValues<E> = E[keyof E];

/**
 * 获取 enum 键列表
 * @param _enum - enum 对象
 * @returns enum 键列表
 */
export function keys<E extends Record<string, any>>(_enum: E): EnumKeys<E>[] {
    return Object.keys(_enum).filter((key) => Number.isNaN(Number(key)));
}

/**
 * 获取 enum 值列表
 * @param _enum - enum 对象
 * @returns enum 值列表
 */
export function values<E extends Record<string, any>>(_enum: E): EnumValues<E>[] {
    return keys(_enum).map((key) => _enum[key]);
}

/**
 * 获取 enum 键值对列表
 * @param _enum - enum 对象
 * @returns enum 键值对列表
 */
export function entries<E extends Record<string, any>>(_enum: E): [EnumKeys<E>, EnumValues<E>][] {
    return keys(_enum).map((key) => [key, _enum[key]]);
}

export const Enum = {
    keys,
    values,
    entries,
} as const;

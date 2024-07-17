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

/**
 * 判断对象是否为空
 * @param obj - 对象
 * @returns 是否为空
 */
export function isEmptyObject(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

export function isString(str: unknown) {
    return Object.prototype.toString.call(str) === "[object String]";
}

export function isObject(obj: unknown) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

export function isArray(arr: unknown) {
    return Array.isArray(arr);
}

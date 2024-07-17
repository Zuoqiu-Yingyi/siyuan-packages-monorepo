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

import type {
    IKeyboardStatus,
    IMouseStatus,
    ITypeStatus,
    TChecker,
} from ".";

/**
 * 判断是否为预期的值
 */
export function isMathced<T>(value: T, checker: TChecker<T>): boolean {
    switch (true) {
        case (checker instanceof Set):
            return (checker as Set<T>).has(value);

        case (checker instanceof Function):
            return (checker as (value: T) => boolean)(value);

        default:
            return value === checker;
    }
}

/* 判断是否为预期的键盘事件 */
export function isMatchedKeyboardEvent(
    e: KeyboardEvent,
    status: IKeyboardStatus,
) {
    return isMathced(e.key, status.key)
        && e.type === status.type
        && e.altKey === status.altKey
        && e.ctrlKey === status.ctrlKey
        && e.metaKey === status.metaKey
        && e.shiftKey === status.shiftKey;
}

/* 判断是否为预期的鼠标事件 */
export function isMatchedMouseEvent(
    e: MouseEvent,
    status: IMouseStatus,
) {
    return isMathced(e.button, status.button)
        && e.type === status.type
        && e.altKey === status.altKey
        && e.ctrlKey === status.ctrlKey
        && e.metaKey === status.metaKey
        && e.shiftKey === status.shiftKey;
}

/* 判断是否为预期的类型事件 */
export function isMatchedTypeEvent(
    e: KeyboardEvent | MouseEvent,
    status: ITypeStatus,
) {
    return isMathced(e.type, status.type)
        && e.altKey === status.altKey
        && e.ctrlKey === status.ctrlKey
        && e.metaKey === status.metaKey
        && e.shiftKey === status.shiftKey;
}

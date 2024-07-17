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

export interface IPosition {
    screenX?: number;
    screenY?: number;
}

/* 计算元素相对于屏幕的位置 */
export function calculateScreenPosition(element: HTMLElement): IPosition {
    const rect = element.getBoundingClientRect();
    return {
        screenX: Math.round(globalThis.screenX + rect.x),
        screenY: Math.round(globalThis.screenY + rect.y),
    };
}

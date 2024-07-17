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

declare module "selection-range" {
    /* eslint-disable tsdoc/syntax */
    /**
     * @param element - 可编辑的容器
     * @param position - 光标位置
     * @param position.start - 光标开始位置
     * @param position.end - 光标结束位置
     * @returns 所选择的区域
     * @see
     * {@link https://www.npmjs.com/package/selection-range | selection-range - npm} |
     * {@link https://github.com/bmcmahen/selection-range/blob/master/index.js | index.js - GitHub}
     */
    /* eslint-enable tsdoc/syntax */
    export default function (
        element: HTMLElement,
        position: {
            start: number;
            end?: number;
        },
    ): Range | void;
}

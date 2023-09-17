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

declare module "selection-range" {
    /**
     * REF: https://www.npmjs.com/package/selection-range
     * 
     * REF: https://github.com/bmcmahen/selection-range/blob/master/index.js
     */
    export default function (
        element: HTMLElement,
        position: {
            start: number,
            end?: number,
        },
    ): Range | void;
}

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

/* 字体处理 */

import type { FontData } from "@workspace/types/misc/browser";

export interface IFonts {
    families: string[];
    map: Map<string, FontData[]>;
}

/* 字体按照字体族分类 */
export function classify(fonts: FontData[]): IFonts {
    const fontList: IFonts = {
        families: [],
        map: new Map<string, FontData[]>(),
    };
    fonts.forEach((font) => {
        const list = fontList.map.get(font.family);
        if (list) {
            list.push(font);
        }
        else {
            fontList.families.push(font.family);
            fontList.map.set(font.family, [font]);
        }
    });
    return fontList;
}

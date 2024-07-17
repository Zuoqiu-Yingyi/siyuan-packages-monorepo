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

import type siyuan from "siyuan";

export function washMenuItems(items: siyuan.IMenuItemOption[]): siyuan.IMenuItemOption[] {
    /* 清理首尾两端的分割线 */
    items = items.slice(
        items.findIndex((item) => item.type !== "separator"),
        items.findLastIndex((item) => item.type !== "separator") + 1,
    );

    if (items.length === 0)
        return items;

    /* 清理连续的分割线 */
    items = items.filter((item, index, items) => {
        if (item.type !== "separator")
            return true;
        else return items[index - 1]?.type !== "separator";
    });

    return items;
}

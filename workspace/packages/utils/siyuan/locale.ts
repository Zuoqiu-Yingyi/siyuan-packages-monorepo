// Copyright (C) 2026 Zuoqiu Yingyi
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

import type { ISiyuanGlobal } from "@workspace/types/siyuan";

/* 是否为中文 */
export function isZhLang(): boolean {
    const lang = (globalThis as ISiyuanGlobal)?.siyuan?.config?.lang
        ?? globalThis.navigator.language
        ?? globalThis.navigator.languages[0];

    if (lang != null) {
        if (lang.startsWith("zh-")) {
            return true;
        }
    }
    return false;
}

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

import { Locale } from "@/opencc";

import type { IConfig } from "@/types/config";
import type { IDicts } from "@/types/dictionary";

export const DEFAULT_CONFIG: IConfig = {
    opencc: {
        dict: "",
        s2t: {
            from: Locale.cn,
            to: Locale.tw,
            dict: "",
        },
        t2s: {
            from: Locale.tw,
            to: Locale.cn,
            dict: "",
        },
        custom: {
            from: Locale.cn,
            to: Locale.hk,
            dict: "",
        },
    },
};

export const DEFAULT_CUSTOM_DICTS: IDicts = {
    global: {
        str: "",
        dict: [],
    },
    s2t: {
        str: "",
        dict: [],
    },
    t2s: {
        str: "",
        dict: [],
    },
    custom: {
        str: "",
        dict: [],
    },
};

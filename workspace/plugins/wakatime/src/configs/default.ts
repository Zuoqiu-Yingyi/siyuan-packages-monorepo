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

import { Category } from "@/wakatime/heartbeats";

import type { IConfig } from "@/types/config";

export const DEFAULT_CONFIG: IConfig = {
    wakatime: {
        api_url: "",
        api_key: "",
        timeout: 30,
        hide_branch_names: true,
        hide_file_names: true,

        offline: false,

        includeID: [],
        excludeID: [],

        include: [],
        exclude: [],

        heartbeats: false,
        project: "",
        language: "",
        hostname: "",
        interval: 60,

        view: {
            category: Category.Browsing,
        },
        edit: {
            category: Category.Learning,
        },

        system_name: "",
        system_version: "unknown",
        system_arch: "unknown",
        useragent: "",
    },
};

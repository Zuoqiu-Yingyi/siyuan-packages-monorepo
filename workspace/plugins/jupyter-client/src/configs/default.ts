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

import type { IConfig } from "@/types/config";

export const DEFAULT_CONFIG: IConfig = {
    jupyter: {
        server: {
            enable: false,
            settings: {
                baseUrl: "",
                appUrl: "",
                wsUrl: "",
                token: "",
                appendToken: false,
            },
        },
        execute: {
            content: {
                silent: false,
                store_history: true,
                user_expressions: {},
                allow_stdin: true,
                stop_on_error: true,
            },
            output: {
                parser: {
                    escaped: true,
                    cntrl: true,
                },
            },
        },
        import: {
            parser: {
                escaped: true,
                cntrl: true,
            },
        },
    },
};

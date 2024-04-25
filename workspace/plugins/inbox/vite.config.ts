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

import deepmerge from "deepmerge";
import {
    defineConfig,
    UserConfig,
} from "vite";

import viteShareConfig from "./vite.share.config";
import viteAppsConfigFn from "./vite.apps.config";
import vitePluginConfigFn from "./vite.plugin.config";

// https://vitejs.dev/config/
export default defineConfig(async (env) => {
    // console.log(env);
    var config: UserConfig;

    switch (env.mode) {
        case "apps":
        case "apps-dev":
            config = await viteAppsConfigFn(env);
            break;

        case "plugin":
        case "plugin-dev":
        default:
            config = await vitePluginConfigFn(env);
            break;
    }
    config = deepmerge.all<UserConfig>([viteShareConfig, config]);

    // console.log(config);
    return config;
});

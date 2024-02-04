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
import { defineConfig, UserConfig } from "vite";

import viteShareConfig from "./vite.share.config";
import vitePluginConfig from "./vite.plugin.config";
import viteAppsConfig from "./vite.apps.config";

// https://vitejs.dev/config/
export default defineConfig(async env => {
    // console.log(env);
    var config: UserConfig;

    switch (env.mode) {
        case "apps":
            config = deepmerge.all<UserConfig>([viteShareConfig, viteAppsConfig]);
            break;

        case "plugin":
        default:
            config = deepmerge.all<UserConfig>([viteShareConfig, vitePluginConfig]);
            break;
    }

    // console.log(config);
    return config;
});

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

import { UserConfig } from "vite";
import { resolve } from "node:path";

import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from "vite-plugin-static-copy";
import { vitePluginForArco } from "@arco-plugins/vite-vue";

// https://vitejs.dev/config/
export default {
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    // REF: https://www.npmjs.com/package/vue-advanced-chat#vue
                    isCustomElement: tag => {
                        // console.log(tag);
                        switch (tag) {
                            case "vue-advanced-chat":
                            case "emoji-picker":
                                return true;
                            default:
                                return /\w+(-\w+)+/.test(tag);
                        }
                    },
                },
            },
        }),
        // REF: https://arco.design/vue/docs/start
        vitePluginForArco({
            style: true,
        }),
        viteStaticCopy({
            targets: [
                /* emoji-picker-element-data */
                {
                    src: "./node_modules/emoji-picker-element-data/zh/cldr/data.json",
                    dest: "./libs/emoji-picker-element-data/zh-Hans/cldr/",
                    // rename: "data.json",
                },
                {
                    src: "./node_modules/emoji-picker-element-data/zh-hant/cldr/data.json",
                    dest: "./libs/emoji-picker-element-data/zh-Hant/cldr/",
                    // rename: "data.json",
                },
                {
                    src: "./node_modules/emoji-picker-element-data/en/cldr/data.json",
                    dest: "./libs/emoji-picker-element-data/en/cldr/",
                    // rename: "data.json",
                },
            ],
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                inbox: resolve(__dirname, "./apps/inbox.html"),
            },
        },
    },
} as UserConfig;

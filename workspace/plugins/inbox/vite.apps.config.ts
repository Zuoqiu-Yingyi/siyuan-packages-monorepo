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

import {
    type UserConfigFnObject,
    type UserConfig,
} from "vite";
import { resolve } from "node:path";

import vue from "@vitejs/plugin-vue";
import {
    VitePWA,
    type ManifestOptions,
} from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { vitePluginForArco } from "@arco-plugins/vite-vue";

import plugin from "./public/plugin.json";

const plugin_root_pathname = `/plugins/${plugin.name}/`;
export const manifest = {
    name: "SiYuan Inbox",
    short_name: "Inbox",
    description: plugin.description.default,
    icons: [
        {
            src: "./icon.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "any",
        }
    ],
    file_handlers: [],
    start_url: "./",
    scope: "./",
    id: "siyuan-plugin-inbox",
    orientation: "any",
    display: "standalone",
    display_override: [
        "window-controls-overlay",
        "standalone",
        "minimal-ui",
        "browser",
    ],
    background_color: "#FFFFFF",
    theme_color: "#1F7E80",
    dir: "ltr",
    lang: "en",
    publicPath: "./",
    related_applications: [],
    prefer_related_applications: false,
    protocol_handlers: [
        {
            protocol: "web+syinbox",
            url: `${plugin_root_pathname}?url=%s`,
        },
    ],
    shortcuts: [
        {
            name: "SiYuan Inbox",
            short_name: "Inbox",
            description: plugin.description.default,
            url: plugin_root_pathname,
            icons: [
                {
                    src: "./icon.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any",
                },
            ],
        },
    ],
    screenshots: [
        {
            src: "./preview.png",
            sizes: "1800x860",
            label: "Wide screenshot",
            form_factor: "wide",
            type: "image/png",
        },
        {
            src: "./preview-mobile.png",
            sizes: "720x1543",
            label: "Narrow screenshot",
            form_factor: "narrow",
            type: "image/png",
        },
    ],
    categories: [
        "productivity",
        "utilities",
        "education",
    ],
    iarc_rating_id: "",
    share_target: {
        action: plugin_root_pathname,
        method: "POST",
        enctype: "multipart/form-data",
        params: {
            title: "title",
            text: "text",
            url: "url",
            files: [
                {
                    name: "Image",
                    accept: [
                        "image/*",
                    ],
                },
                {
                    name: "Audio",
                    accept: [
                        "audio/*",
                    ],
                },
                {
                    name: "Video",
                    accept: [
                        "video/*",
                    ],
                },
                {
                    name: "Asset",
                    accept: [
                        "*/*",
                    ],
                },
            ],
        },
    },
    handle_links: "auto",
    launch_handler: {
        client_mode: [
            "auto",
            "focus-existing",
            "navigate-existing",
            "navigate-new",
        ],
    },
    edge_side_panel: {
        preferred_width: 360,
    },
    scope_extensions: [],
} satisfies ManifestOptions;

// https://vitejs.dev/config/
export const userConfigFn: UserConfigFnObject = function (env) {
    const dev = env.mode.endsWith("dev");
    const config = {
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
            // REF: https://vite-pwa-org.netlify.app/guide/
            VitePWA({
                mode: dev
                    ? "development"
                    : "production",
                filename: "service-worker.js",
                manifestFilename: "manifest.webmanifest",
                strategies: "generateSW",
                registerType: "autoUpdate",
                minify: dev
                    ? false
                    : true,
                manifest,
                workbox: {
                    globIgnores: [
                        "index.css",
                        "index.js",
                        "i18n/**/*.json",
                    ],
                    globPatterns: [
                        "**/*.{js,css,html,ico,png,svg,json}",
                    ],
                },
                includeAssets: [],
                devOptions: {
                    enabled: dev,
                },
            }),
        ],
        build: {
            sourcemap: dev
                ? "inline"
                : false,
            rollupOptions: {
                input: {
                    index: resolve(__dirname, "./index.html"),
                },
            },
        },
    } satisfies UserConfig;

    return config;
};
export default userConfigFn;

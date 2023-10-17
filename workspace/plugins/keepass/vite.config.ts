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
    defineConfig,
    type BuildOptions,
} from "vite";
import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { less } from "svelte-preprocess-less";

type ExternalOption = BuildOptions["rollupOptions"]["external"];

// https://vitejs.dev/config/
export default defineConfig(async env => ({
    base: `./`,
    plugins: [
        svelte({
            preprocess: {
                style: less(),
            },
        }),
    ],
    resolve: {
        alias: {
            "~": resolve(__dirname, "./"),
            "@": resolve(__dirname, "./src"),
        }
    },
    build: {
        minify: true,
        // sourcemap: "inline",
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            fileName: "index",
            formats: ["cjs"],
        },
        rollupOptions: {
            external: external(env.mode),
            output: {
                entryFileNames: chunkInfo => {
                    // console.log(chunkInfo);
                    switch (chunkInfo.name) {
                        case "index":
                            return "[name].js";
                        case "plugin":
                            return "keeweb/plugins/siyuan/plugin.js";

                        default:
                            return "assets/[name]-[hash].js";
                    }
                },
                assetFileNames: assetInfo => {
                    // console.log(chunkInfo);
                    switch (assetInfo.name) {
                        case "style.css":
                        case "index.css":
                            return "index.css";

                        default:
                            return "assets/[name]-[hash][extname]";
                    }
                },
            },
        },
        ...build(env.mode),
    },
}));

function external(mode: string): ExternalOption {
    switch (mode) {
        default:
        case "siyuan-plugin":
            return [
                "siyuan",
                /^@electron\/.*$/,
            ];

        case "keeweb-plugin":
            return [
                "hbs",
                "kdbxweb",
                "pikaday",
                "qrcode",
                /^auto-type\/.*$/,
                /^collections\/.*$/,
                /^comp\/.*$/,
                /^const\/.*$/,
                /^framework\/.*$/,
                /^hbs-helpers\/.*$/,
                /^locales\/.*$/,
                /^models\/.*$/,
                /^plugins\/.*$/,
                /^presenters\/.*$/,
                /^storage\/.*$/,
                /^util\/.*$/,
                /^views\/.*$/,
            ];
    }
}

function build(mode: string): BuildOptions {
    switch (mode) {
        default:
        case "siyuan-plugin":
            return {
                emptyOutDir: true,
                lib: {
                    entry: resolve(__dirname, "src/index.ts"),
                    fileName: "index",
                    formats: ["cjs"],
                }
            };

        case "keeweb-plugin":
            return {
                emptyOutDir: false,
                lib: {
                    entry: resolve(__dirname, "src/keeweb/plugin.ts"),
                    fileName: "plugin",
                    formats: ["cjs"],
                }
            };
    }
}

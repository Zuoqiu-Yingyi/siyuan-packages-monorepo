"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_vue_1 = __importDefault(require("@vitejs/plugin-vue"));
var vite_plugin_svelte_1 = require("@sveltejs/vite-plugin-svelte");
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)({
    base: "./",
    plugins: [
        (0, plugin_vue_1.default)(),
        (0, vite_plugin_svelte_1.svelte)(),
    ],
});
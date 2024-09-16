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

import browserify from "path-browserify";

import type path from "node:path";

export default browserify;

export const basename: typeof path.basename = browserify.basename;

export const dirname: typeof path.dirname = browserify.dirname;

export const extname: typeof path.extname = browserify.extname;

export const format: typeof path.format = browserify.format;

export const isAbsolute: typeof path.isAbsolute = browserify.isAbsolute;

export const join: typeof path.join = browserify.join;

export const normalize: typeof path.normalize = browserify.normalize;

export const parse: typeof path.parse = browserify.parse;

export const resolve: typeof path.resolve = browserify.resolve;

export const relative: typeof path.relative = browserify.relative;

// export const toNamespacedPath: typeof path.toNamespacedPath = browserify.toNamespacedPath.bind(browserify);

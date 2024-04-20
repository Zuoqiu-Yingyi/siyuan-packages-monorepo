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

import browserify from "path-browserify";
import type path from "node:path";

export default browserify;

export const basename: typeof path.basename = browserify.basename.bind(browserify);

export const dirname: typeof path.dirname = browserify.dirname.bind(browserify);

export const extname: typeof path.extname = browserify.extname.bind(browserify);

export const format: typeof path.format = browserify.format.bind(browserify);

export const isAbsolute: typeof path.isAbsolute = browserify.isAbsolute.bind(browserify);

export const join: typeof path.join = browserify.join.bind(browserify);

export const normalize: typeof path.normalize = browserify.normalize.bind(browserify);

export const parse: typeof path.parse = browserify.parse.bind(browserify);

export const resolve: typeof path.resolve = browserify.resolve.bind(browserify);

export const relative: typeof path.relative = browserify.relative.bind(browserify);

// export const toNamespacedPath: typeof path.toNamespacedPath = browserify.toNamespacedPath.bind(browserify);

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

import type path from "node:path";

const _path = globalThis
    ?.require
    ?.("node:path");

/**
 * @inheritdoc {@link path.resolve}
 */
export const resolve: typeof path.resolve = (...args: any[]) => {
    return _path?.resolve?.(...args);
}

/**
 * @inheritdoc {@link path.normalize}
 */
export const normalize: typeof path.normalize = (...args: any[]) => {
    return _path?.normalize?.(...args);
}

/**
 * @inheritdoc {@link path.isAbsolute}
 */
export const isAbsolute: typeof path.isAbsolute = (...args: any[]) => {
    return _path?.isAbsolute?.(...args);
}

/**
 * @inheritdoc {@link path.join}
 */
export const join: typeof path.join = (...args: any[]) => {
    return _path?.join?.(...args);
}

/**
 * @inheritdoc {@link path.relative}
 */
export const relative: typeof path.relative = (...args: any[]) => {
    return _path?.relative?.(...args);
}

/**
 * @inheritdoc {@link path.toNamespacedPath}
 */
export const toNamespacedPath: typeof path.toNamespacedPath = (...args: any[]) => {
    return _path?.toNamespacedPath?.(...args);
}

/**
 * @inheritdoc {@link path.dirname}
 */
export const dirname: typeof path.dirname = (...args: any[]) => {
    return _path?.dirname?.(...args);
}

/**
 * @inheritdoc {@link path.basename}
 */
export const basename: typeof path.basename = (...args: any[]) => {
    return _path?.basename?.(...args);
}

/**
 * @inheritdoc {@link path.extname}
 */
export const extname: typeof path.extname = (...args: any[]) => {
    return _path?.extname?.(...args);
}

/**
 * @inheritdoc {@link path.format}
 */
export const format: typeof path.format = (...args: any[]) => {
    return _path?.format?.(...args);
}

/**
 * @inheritdoc {@link path.parse}
 */
export const parse: typeof path.parse = (...args: any[]) => {
    return _path?.parse?.(...args);
}

/**
 * @inheritdoc {@link path.sep}
 */
export const sep: typeof path.sep = _path?.sep;

/**
 * @inheritdoc {@link path.delimiter}
 */
export const delimiter: typeof path.delimiter = _path?.delimiter;

/**
 * @inheritdoc {@link path.win32}
 */
export const win32: typeof path.win32 = _path?.win32;

/**
 * @inheritdoc {@link path.posix}
 */
export const posix: typeof path.posix = _path?.posix;

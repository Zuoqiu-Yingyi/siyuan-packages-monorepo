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

import type { Electron } from "@workspace/types/electron";

const clipboard = globalThis
    ?.require
    ?.("electron")
    ?.clipboard;

/**
 * @inheritdoc {@link Electron.Clipboard.availableFormats}
 */
export const availableFormats: Electron.Clipboard["availableFormats"] = (...args: any[]) => {
    return clipboard
        ?.availableFormats
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.has}
 */
export const has: Electron.Clipboard["has"] = (...args: any[]) => {
    return clipboard
        ?.has
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.read}
 */
export const read: Electron.Clipboard["read"] = (...args: any[]) => {
    return clipboard
        ?.read
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.write}
 */
export const write: Electron.Clipboard["write"] = (...args: any[]) => {
    return clipboard
        ?.write
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.readText}
 */
export const readText: Electron.Clipboard["readText"] = (...args: any[]) => {
    return clipboard
        ?.readText
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.writeText}
 */
export const writeText: Electron.Clipboard["writeText"] = (...args: any[]) => {
    return clipboard
        ?.writeText
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.readRTF}
 */
export const readRTF: Electron.Clipboard["readRTF"] = (...args: any[]) => {
    return clipboard
        ?.readRTF
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.writeRTF}
 */
export const writeRTF: Electron.Clipboard["writeRTF"] = (...args: any[]) => {
    return clipboard
        ?.writeRTF
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.readHTML}
 */
export const readHTML: Electron.Clipboard["readHTML"] = (...args: any[]) => {
    return clipboard
        ?.readHTML
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.writeHTML}
 */
export const writeHTML: Electron.Clipboard["writeHTML"] = (...args: any[]) => {
    return clipboard
        ?.writeHTML
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.readBookmark}
 */
export const readBookmark: Electron.Clipboard["readBookmark"] = (...args: any[]) => {
    return clipboard
        ?.readBookmark
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.writeBookmark}
 */
export const writeBookmark: Electron.Clipboard["writeBookmark"] = (...args: any[]) => {
    return clipboard
        ?.writeBookmark
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.readImage}
 */
export const readImage: Electron.Clipboard["readImage"] = (...args: any[]) => {
    return clipboard
        ?.readImage
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.writeImage}
 */
export const writeImage: Electron.Clipboard["writeImage"] = (...args: any[]) => {
    return clipboard
        ?.writeImage
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.readFindText}
 */
export const readFindText: Electron.Clipboard["readFindText"] = (...args: any[]) => {
    return clipboard
        ?.readFindText
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.writeFindText}
 */
export const writeFindText: Electron.Clipboard["writeFindText"] = (...args: any[]) => {
    return clipboard
        ?.writeFindText
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.readBuffer}
 */
export const readBuffer: Electron.Clipboard["readBuffer"] = (...args: any[]) => {
    return clipboard
        ?.readBuffer
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.writeBuffer}
 */
export const writeBuffer: Electron.Clipboard["writeBuffer"] = (...args: any[]) => {
    return clipboard
        ?.writeBuffer
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Clipboard.clear}
 */
export const clear: Electron.Clipboard["clear"] = (...args: any[]) => {
    return clipboard
        ?.clear
        ?.(...args);
}

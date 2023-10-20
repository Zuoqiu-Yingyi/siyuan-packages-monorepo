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
import { normalize } from "./../node/path";

const shell = globalThis
    ?.require
    ?.("electron")
    ?.shell;

/**
 * @inheritdoc {@link Electron.Shell.showItemInFolder}
 */
export const showItemInFolder: Electron.Shell["showItemInFolder"] = (fullPath: string) => {
    const normalized_fullPath = normalize(fullPath);
    if (normalized_fullPath) {
        return shell
            ?.showItemInFolder
            ?.(normalized_fullPath);
    }
}

/**
 * @inheritdoc {@link Electron.Shell.openPath}
 */
export const openPath: Electron.Shell["openPath"] = (...args: any[]) => {
    return shell
        ?.openPath
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Shell.openExternal}
 */
export const openExternal: Electron.Shell["openExternal"] = (...args: any[]) => {
    return shell
        ?.openExternal
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Shell.trashItem}
 */
export const trashItem: Electron.Shell["trashItem"] = (...args: any[]) => {
    return shell
        ?.trashItem
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Shell.beep}
 */
export const beep: Electron.Shell["beep"] = (...args: any[]) => {
    return shell
        ?.beep
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Shell.writeShortcutLink}
 */
export const writeShortcutLink: Electron.Shell["writeShortcutLink"] = (...args: any[]) => {
    return shell
        ?.writeShortcutLink
        ?.(...args);
}

/**
 * @inheritdoc {@link Electron.Shell.readShortcutLink}
 */
export const readShortcutLink: Electron.Shell["readShortcutLink"] = (...args: any[]) => {
    return shell
        ?.readShortcutLink
        ?.(...args);
}

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

import { Electron } from "@workspace/types/electron";

export const showItemInFolder: Electron.Shell["showItemInFolder"] = (fullPath: string) => {
    const normalized_fullPath = globalThis
        ?.require("path")
        ?.normalize(fullPath);
    if (normalized_fullPath) {
        globalThis
            ?.require
            ?.("electron")
            ?.shell
            ?.showItemInFolder
            ?.(normalized_fullPath);
    }
}

export const openPath: Electron.Shell["openPath"] = (path: string) => {
    return globalThis
        ?.require("electron")
        ?.shell
        ?.openPath(path);
}

export const openExternal: Electron.Shell["openExternal"] = (url: string, options?: Electron.OpenExternalOptions) => {
    return globalThis
        ?.require("electron")
        ?.shell
        ?.openExternal(url, options);
}

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

import { normalize } from "./../node/path";

import type { Electron } from "@workspace/types/electron";

export const shell: Electron.Shell = globalThis
    ?.require
    ?.("electron")
    ?.shell;

export default shell;

export const beep = shell?.beep?.bind?.(shell);
export const openExternal = shell?.openExternal?.bind?.(shell);
export const openPath = shell?.openPath?.bind?.(shell);
export const readShortcutLink = shell?.readShortcutLink?.bind?.(shell);

/**
 * {@inheritdoc Electron.Shell.showItemInFolder}
 * @see {@link Electron.Shell.showItemInFolder}
 */
export const showItemInFolder: Electron.Shell["showItemInFolder"] = (fullPath: string) => {
    const normalized_fullPath = normalize(fullPath);
    if (normalized_fullPath) {
        return shell
            ?.showItemInFolder
            ?.(normalized_fullPath);
    }
};

export const trashItem = shell?.trashItem?.bind?.(shell);
export const writeShortcutLink = shell?.writeShortcutLink?.bind?.(shell);

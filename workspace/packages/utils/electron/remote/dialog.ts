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

export const dialog: Electron.Dialog = globalThis
    ?.require
    ?.("@electron/remote")
    ?.dialog;

export default dialog;

export const showErrorBox = dialog?.showErrorBox?.bind?.(dialog);
export const showMessageBox = dialog?.showMessageBox?.bind?.(dialog);
export const showMessageBoxSync = dialog?.showMessageBoxSync?.bind?.(dialog);
export const showOpenDialog = dialog?.showOpenDialog?.bind?.(dialog);
export const showOpenDialogSync = dialog?.showOpenDialogSync?.bind?.(dialog);
export const showSaveDialog = dialog?.showSaveDialog?.bind?.(dialog);
export const showSaveDialogSync = dialog?.showSaveDialogSync?.bind?.(dialog);

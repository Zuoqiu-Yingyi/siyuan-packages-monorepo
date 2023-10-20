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

export const clipboard: Electron.Clipboard = globalThis
    ?.require
    ?.("electron")
    ?.clipboard;

export default clipboard;

export const availableFormats = clipboard?.availableFormats?.bind?.(clipboard);
export const clear = clipboard?.clear?.bind?.(clipboard);
export const has = clipboard?.has?.bind?.(clipboard);
export const read = clipboard?.read?.bind?.(clipboard);
export const readBookmark = clipboard?.readBookmark?.bind?.(clipboard);
export const readBuffer = clipboard?.readBuffer?.bind?.(clipboard);
export const readFindText = clipboard?.readFindText?.bind?.(clipboard);
export const readHTML = clipboard?.readHTML?.bind?.(clipboard);
export const readImage = clipboard?.readImage?.bind?.(clipboard);
export const readRTF = clipboard?.readRTF?.bind?.(clipboard);
export const readText = clipboard?.readText?.bind?.(clipboard);
export const write = clipboard?.write?.bind?.(clipboard);
export const writeBookmark = clipboard?.writeBookmark?.bind?.(clipboard);
export const writeBuffer = clipboard?.writeBuffer?.bind?.(clipboard);
export const writeFindText = clipboard?.writeFindText?.bind?.(clipboard);
export const writeHTML = clipboard?.writeHTML?.bind?.(clipboard);
export const writeImage = clipboard?.writeImage?.bind?.(clipboard);
export const writeRTF = clipboard?.writeRTF?.bind?.(clipboard);
export const writeText = clipboard?.writeText?.bind?.(clipboard);

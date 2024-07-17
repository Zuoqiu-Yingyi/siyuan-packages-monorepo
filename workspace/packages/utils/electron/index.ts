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

import type { Electron } from "@workspace/types/electron";

export interface IElectron {
    clipboard: Electron.Clipboard;
    contextBridge: Electron.ContextBridge;
    crashReporter: Electron.CrashReporter;
    ipcRenderer: Electron.IpcRenderer;
    nativeImage: typeof Electron.NativeImage;
    shell: Electron.Shell;
    webFrame: Electron.WebFrame;
}

export const electron: IElectron = globalThis
    ?.require
    ?.("electron");

export default electron;

export const clipboard = electron?.clipboard;
export const contextBridge = electron?.contextBridge;
export const crashReporter = electron?.crashReporter;
export const ipcRenderer = electron?.ipcRenderer;
export const nativeImage = electron?.nativeImage;
export const shell = electron?.shell;
export const webFrame = electron?.webFrame;

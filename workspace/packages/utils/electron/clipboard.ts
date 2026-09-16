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

import { dataURL2blob } from "./../misc/dataurl";

import type { Electron } from "@workspace/types/electron";

/**
 * Electron 44 移除了全部同步剪贴板方法, 仅保留 `clear` / `has` / `read` / `readText` / `write` / `writeText`
 * (且均改为返回 Promise), 新增 `clipboard.write(ClipboardItem[])` 作为写入多种格式的入口
 * REF: https://www.electronjs.org/docs/latest/api/clipboard
 *
 * 思源自 Electron 44 起不再提供这些同步方法, 但较旧版本的思源仍然提供,
 * 因此这里同时保留旧同步 API 的类型与运行时探测
 */
export interface ILegacyClipboard {
    availableFormats?: (type?: "clipboard" | "selection") => string[];
    readBookmark?: () => { title: string; url: string };
    readBuffer?: (format: string) => Uint8Array;
    readFindText?: () => string;
    readHTML?: (type?: "clipboard" | "selection") => string;
    readImage?: (type?: "clipboard" | "selection") => Electron.NativeImage;
    readRTF?: (type?: "clipboard" | "selection") => string;
    writeBookmark?: (title: string, url: string, type?: "clipboard" | "selection") => void;
    writeBuffer?: (format: string, buffer: Uint8Array, type?: "clipboard" | "selection") => void;
    writeFindText?: (text: string) => void;
    writeHTML?: (markup: string, type?: "clipboard" | "selection") => void;
    writeImage?: (image: Electron.NativeImage, type?: "clipboard" | "selection") => void;
    writeRTF?: (text: string, type?: "clipboard" | "selection") => void;
}

/* `ClipboardItem` 由 electron 模块导出 (Electron 44+), 与浏览器同名全局构造函数的入参不完全一致 */
export type TClipboardItemConstructor = new (
    items: Record<string, Blob | Promise<Blob | string> | string>,
) => Electron.ClipboardItem;

const electron = globalThis
    ?.require
    ?.("electron");

export const clipboard: Electron.Clipboard & ILegacyClipboard = electron?.clipboard;

export default clipboard;

export const ClipboardItem: TClipboardItemConstructor | undefined = electron?.ClipboardItem;

/* 仅供旧版同步 API 的兼容分支使用, `nativeImage` 的公开导出见 `./index` */
const nativeImage: typeof Electron.nativeImage | undefined = electron?.nativeImage;

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

/**
 * 将 HTML 写入剪贴板
 * 优先使用旧版同步 API, 在 Electron 44+ 上退回 `clipboard.write(ClipboardItem[])`
 * @param markup - HTML 代码
 * @param text - 纯文本备选内容, 默认与 HTML 代码相同
 */
export async function writeHTMLCompat(
    markup: string,
    text: string = markup,
): Promise<void> {
    if (clipboard?.writeHTML) {
        clipboard.writeHTML(markup);
        return;
    }
    if (clipboard?.write && ClipboardItem) {
        await clipboard.write([
            new ClipboardItem({
                "text/html": markup,
                "text/plain": text,
            }),
        ]);
    }
}

/**
 * 将图片写入剪贴板
 * 优先使用旧版同步 API, 在 Electron 44+ 上退回 `clipboard.write(ClipboardItem[])`
 * @param dataURL - 图片的 data URL
 */
export async function writeImageCompat(dataURL: string): Promise<void> {
    if (clipboard?.writeImage && nativeImage) {
        clipboard.writeImage(nativeImage.createFromDataURL(dataURL));
        return;
    }
    if (clipboard?.write && ClipboardItem) {
        const blob = dataURL2blob(dataURL);
        if (blob) {
            await clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
        }
    }
}

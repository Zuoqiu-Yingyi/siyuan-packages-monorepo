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

import parser from "parse-data-url";
import { Buffer } from "buffer";

globalThis.Buffer = Buffer;

export function dataURL2str(dataURL: string): string | undefined {
    const result = parser(dataURL);
    if (result) {
        return result.toBuffer().toString();
    }
    return;
}

export function dataURL2blob(dataURL: string): Blob | undefined {
    const result = parser(dataURL);
    if (result) {
        return new Blob(
            [result.toBuffer()],
            { type: result.contentType },
        );
    }
    return;
}

export function base64ToDataURL(
    base64: string,
    mime: string,
): string {
    return `data:${mime};base64,${base64}`;
}

export function base64ToBlob(
    base64: string,
    mime: string,
): Blob | undefined {
    const data_url = base64ToDataURL(base64, mime);
    return dataURL2blob(data_url);
}

export function base64ToFile(
    base64: string,
    mime: string,
    filename: string,
): File | undefined {
    const blob = base64ToBlob(base64, mime);
    if (blob) {
        return new File([blob], filename, {
            type: mime,
        });
    }
    return;
}

export async function blob2dataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        // REF: https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
        const reader = new FileReader();

        reader.addEventListener("load", e => resolve(reader.result as string), {
            once: true,
            passive: true,
        });
        reader.addEventListener("error", e => reject(e), {
            once: true,
            passive: true,
        });
        // REF: https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsDataURL
        reader.readAsDataURL(blob);
    });
}

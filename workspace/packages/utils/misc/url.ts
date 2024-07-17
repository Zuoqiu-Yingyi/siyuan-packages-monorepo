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

/* 将 file:// 转换为绝对路径 */
export function uri2path(uri: string): string {
    const url = new URL(uri);
    if (/^\/\w:\//.test(url.pathname)) { // windows 路径
        return url.pathname.substring(1);
    }
    else {
        return url.pathname;
    }
}

/**
 * 将 src 转换为 URL 对象
 * @param src - 目标资源
 * - `/foo`: 绝对路径
 * - `./bar`: 相对于 baseURL 的相对路径
 * @returns URL 对象
 */
export function src2url(src: string): URL {
    const a = globalThis.document.createElement("a");
    a.href = src;
    return new URL(a.href);
}

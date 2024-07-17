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

import { trimPrefix } from "../misc/string";

import type { siyuan } from "@siyuan-community/siyuan-sdk";

export type TSiyuanBlockType = siyuan.BlockSubType | siyuan.BlockType | siyuan.NodeType;

const MAP_PATH_ICON = new Map<string, string>([
    ["stage", "iconFolder"], // 安装目录/resources/stage
    ["assets", "iconImage"], // 工作空间/data/assets
    ["assets", "iconImage"], // 工作空间/data/assets
    ["emojies", "iconEmoji"], // 工作空间/data/emojies
    ["plugins", "iconPlugin"], // 工作空间/data/plugins
    ["public", "iconCloud"], // 工作空间/data/public
    ["snippets", "iconCode"], // 工作空间/data/snippets
    ["templates", "iconMarkdown"], // 工作空间/data/templates
    ["widgets", "iconBoth"], // 工作空间/data/widgets
    ["appearance", "iconTheme"], // 工作空间/conf/appearance
    ["export", "iconUpload"], // 工作空间/temp/export
    ["history", "iconHistory"], // 工作空间/history
]);

const MAP_TYPE_ICON = new Map<string | TSiyuanBlockType, string>([
    ["NodeNotebook", "iconFilesRoot"],
    ["NodeFolder", "iconFolder"],
    ["d", "iconFile"],
    ["NodeDocument", "iconFile"],
    ["s", "iconSuper"],
    ["NodeSuperBlock", "iconSuper"],
    ["b", "iconQuote"],
    ["NodeBlockquote", "iconQuote"],
    ["l", "iconList"],
    ["NodeList", "iconList"],
    ["i", "iconListItem"],
    ["NodeListItem", "iconListItem"],
    ["h", "iconHeadings"],
    ["NodeHeading", "iconHeadings"],
    ["p", "iconParagraph"],
    ["NodeParagraph", "iconParagraph"],
    ["m", "iconMath"],
    ["NodeMathBlock", "iconMath"],
    ["t", "iconTable"],
    ["NodeTable", "iconTable"],
    ["c", "iconCode"],
    ["NodeCodeBlock", "iconCode"],
    ["html", "iconHTML5"],
    ["NodeHTMLBlock", "iconHTML5"],
    ["tb", "#iconLine"],
    ["NodeThematicBreak", "#iconLine"],
    ["audio", "iconRecord"],
    ["NodeAudio", "iconRecord"],
    ["video", "iconVideo"],
    ["NodeVideo", "iconVideo"],
    ["iframe", "iconLanguage"],
    ["NodeIFrame", "iconLanguage"],
    ["widget", "iconBoth"],
    ["NodeWidget", "iconBoth"],
    ["query_embed", "iconSQL"],
    ["NodeBlockQueryEmbed", "iconSQL"],

    ["h1", "iconH1"],
    ["h2", "iconH2"],
    ["h3", "iconH3"],
    ["h4", "iconH4"],
    ["h5", "iconH5"],
    ["h6", "iconH6"],

    ["u", "iconList"],
    ["o", "iconOrderedList"],
    ["t", "iconCheck"],
]);

/**
 * 思源静态 web 文件目录 👉 图标
 * @param path - 思源静态 web 文件目录
 * @returns 图标 ID
 */
export function path2icon(path: string): string {
    return MAP_PATH_ICON.get(path) ?? "iconHelp";
}

/**
 * 思源静态 web 文件路径 👉 图标
 * @param pathname - 思源静态 web 文件路径
 * @returns 图标 ID
 */
export function pathname2icon(pathname: string): string {
    if (pathname.startsWith("/"))
        pathname = pathname.substring(1);
    const path = trimPrefix(pathname, "/").split("/")[0]!;
    return path2icon(path);
}

/**
 * 思源块类型 👉 图标
 * @param type - 思源块类型
 * @returns 图标 ID
 */
export function type2icon(type: string | TSiyuanBlockType): string {
    return MAP_TYPE_ICON.get(type) ?? "iconHelp";
}

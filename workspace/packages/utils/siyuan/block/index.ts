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

import { siyuan } from "@siyuan-community/siyuan-sdk";

/* 是否为叶子节点 */
export function isLeafNode(node: HTMLElement | siyuan.NodeType): boolean {
    if (node instanceof HTMLElement) {
        node = node.dataset.type as siyuan.NodeType;
    }
    switch (node) {
        case siyuan.NodeType.NodeHeading:
        case siyuan.NodeType.NodeParagraph:
        case siyuan.NodeType.NodeMathBlock:
        case siyuan.NodeType.NodeTable:
        case siyuan.NodeType.NodeCodeBlock:
        case siyuan.NodeType.NodeHTMLBlock:
        case siyuan.NodeType.NodeThematicBreak:
        case siyuan.NodeType.NodeAudio:
        case siyuan.NodeType.NodeVideo:
        case siyuan.NodeType.NodeIFrame:
        case siyuan.NodeType.NodeWidget:
        case siyuan.NodeType.NodeBlockQueryEmbed:
            return true;
        default:
            return false;
    }
}

/* 是否为容器节点 */
export function isContainerNode(node: HTMLElement | siyuan.NodeType): boolean {
    if (node instanceof HTMLElement) {
        node = node.dataset.type as siyuan.NodeType;
    }
    switch (node) {
        case siyuan.NodeType.NodeDocument:
        case siyuan.NodeType.NodeSuperBlock:
        case siyuan.NodeType.NodeBlockquote:
        case siyuan.NodeType.NodeList:
        case siyuan.NodeType.NodeListItem:
            return true;
        default:
            return false;
    }
}

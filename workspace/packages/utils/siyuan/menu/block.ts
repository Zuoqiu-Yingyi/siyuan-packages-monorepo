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

// import { BlockType } from "./../block";
import * as sdk from "@siyuan-community/siyuan-sdk";

/* 块菜单 */
import type siyuan from "siyuan";

import type { BlockID } from "@workspace/types/siyuan";
import type { IProtyle } from "@workspace/types/siyuan/protyle";

/* 块菜单上下文 */
export interface IBlockMenuDetail {
    menu: InstanceType<typeof siyuan.EventMenu>;
    protyle: IProtyle;
    data?: IDocumentData;
    blockElements?: HTMLElement[];
}

export interface IDocumentData {
    id: BlockID;
    ial: Record<string, string>;
    icon: string;
    name: string;
    rootID: BlockID;
    refIDs: BlockID[];
    refCount: number;
    subFileCount: number;
}

/* 文档块菜单上下文 */
export interface IDocumentBlockMenuDetail extends IBlockMenuDetail {
    data: IDocumentData;
}

/* 其他块菜单上下文 */
export interface IOtherBlockMenuDetail extends IBlockMenuDetail {
    blockElements: HTMLElement[];
}

export type BlockMenuDetail = IDocumentBlockMenuDetail | IOtherBlockMenuDetail;

export interface IBlockContext {
    element: HTMLElement; // 块 DOM
    id: BlockID; // 块 ID
    type: sdk.siyuan.NodeType; // 块类型
    subtype?: sdk.siyuan.BlockSubType; // 块子类型
}

export interface IBaseBlockMenuContext extends IBlockContext {
    isDocumentBlock: boolean; // 是否为文档块
    isMultiBlock: boolean; // 是否为多个块
    blocks: IBlockContext[];
    protyle: IProtyle; // 编辑器对象
}

export interface IOtherBlockMenuContext extends IBaseBlockMenuContext {
    isDocumentBlock: false; // 是否为文档块
}

export interface IDocumentBlockMenuContext extends IBaseBlockMenuContext {
    isDocumentBlock: true; // 是否为文档块
    isMultiBlock: false; // 是否为多个块
    data: siyuan.IGetDocInfo; // 文档数据
}

export type IBlockMenuContext = IDocumentBlockMenuContext | IOtherBlockMenuContext;

/* 划选内容的上下文 */
export interface ISelectedMenuContext {
    block: IBlockContext;
    range: Range;
}

/* 块菜单上下文 */
export function getBlockMenuContext(detail: BlockMenuDetail): IBlockMenuContext | null {
    const { protyle, data, blockElements } = detail;

    if (data) { // 文档块
        const context: IBlockContext = {
            element: protyle.wysiwyg!.element,
            id: data.id,
            type: sdk.siyuan.NodeType.NodeDocument,
        };
        return {
            ...context,
            isDocumentBlock: true,
            isMultiBlock: false,
            blocks: [context],
            protyle,
            data,
        };
    }
    else if (blockElements) { // 其他块
        if (blockElements.length > 0) {
            const blocks: IBlockContext[] = [];
            blockElements.forEach((item: HTMLElement) => {
                blocks.push({
                    element: item,
                    id: item.dataset.nodeId as BlockID,
                    type: item.dataset.type as sdk.siyuan.NodeType,
                    subtype: item.dataset.subtype as sdk.siyuan.BlockSubType,
                });
            });
            return {
                ...blocks[0]!,
                isDocumentBlock: false,
                isMultiBlock: blocks.length > 1,
                blocks,
                protyle,
            };
        }
    }

    return null;
}

/* 划选菜单上下文 */
export function getSelectedMenuContext(detail: siyuan.IEventBusMap["open-menu-content"]): ISelectedMenuContext | null {
    const { element, range } = detail;

    if (element && range) {
        return {
            block: {
                element,
                id: element.dataset.nodeId as BlockID,
                type: element.dataset.type as sdk.siyuan.NodeType,
                subtype: element.dataset.subtype as sdk.siyuan.BlockSubType,
            },
            range,
        };
    }
    return null;
}

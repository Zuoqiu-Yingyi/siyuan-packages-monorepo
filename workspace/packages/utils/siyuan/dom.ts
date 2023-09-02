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

import siyuan from "siyuan";
import {
    BlockID,
    SnippetID,
    ShorthandID,
    HistoryPath,
    HistoryCreated,
    SnapshotID,
    ISiyuanGlobal,
} from "@workspace/types/siyuan";
import regexp from "./../regexp";

declare var globalThis: ISiyuanGlobal;

/**
 * 查询块 ID
 * @param e: 事件
 * @return: 块 ID
 */
export function getBlockID(e: Event): BlockID | void {
    const path = e.composedPath();
    for (let i = 0; i < path.length; ++i) {
        const dataset = (path[i] as HTMLElement).dataset;
        if (dataset) {
            switch (true) {
                case dataset.nodeId && regexp.id.test(dataset.nodeId):
                    return dataset.nodeId;
                case dataset.id && regexp.id.test(dataset.id):
                    return dataset.id;
                case dataset.oid && regexp.id.test(dataset.oid):
                    return dataset.oid;
                case dataset.rootId && regexp.id.test(dataset.rootId):
                    return dataset.rootId;

                default:
                    break
            }
        }
    }
    return;
}

/**
 * 获取代码片段 ID
 * @param e: 事件
 * @return: 收集箱 ID
 */
export function getSnippetID(e: Event): SnippetID | void {
    const path = e.composedPath();
    for (let i = 0; i < path.length; ++i) {
        const element = path[i] as HTMLElement;
        const dataset = element.dataset;
        if (dataset) {
            switch (true) {
                case dataset.id && regexp.snippet.test(dataset.id):
                    if (dataset.type === "css" || dataset.type === "js") {
                        return dataset.id;
                    }
                    break
                default:
                    break
            }
        }
    }
    return;
}

/**
 * 获取收集箱项 ID
 * @param e: 事件
 * @return: 收集箱 ID
 */
export function getShorthandID(e: Event): ShorthandID | void {
    const path = e.composedPath();
    for (let i = 0; i < path.length; ++i) {
        const element = path[i] as HTMLElement;
        const dataset = element.dataset;
        if (dataset) {
            switch (true) {
                case dataset.id && regexp.shorthand.test(dataset.id):
                    if (
                        element
                            ?.parentElement
                            ?.classList
                            ?.contains
                            ?.("sy_inbox") // 收集箱项内容
                        || element
                            ?.parentElement
                            ?.parentElement
                            ?.parentElement
                            ?.classList
                            ?.contains
                            ?.("sy__inbox") // 收集箱项标题
                    ) {
                        return dataset.id;
                    }
                    break
                default:
                    break
            }
        }
    }
    return;
}

/**
 * 获取文档历史创建时间
 * @param e: 事件
 * @return: 文档历史创建时间
 */
export function getHistoryCreated(e: Event): HistoryCreated | void {
    const path = e.composedPath();
    for (let i = 0; i < path.length; ++i) {
        const element = path[i] as HTMLElement;
        const dataset = element.dataset;
        if (dataset) {
            switch (true) {
                case dataset.created && regexp.created.test(dataset.created):
                    if (
                        element
                            ?.parentElement
                            ?.parentElement
                            ?.classList
                            ?.contains
                            ?.("history__panel") // 文件历史面板
                        && !element
                            ?.parentElement
                            ?.parentElement
                            ?.parentElement
                            ?.classList
                            ?.contains
                            ?.("history__repo") // 非数据历史面板
                    ) {
                        return dataset.created;
                    }
                    break
                default:
                    break
            }
        }
    }
    return;
}

/**
 * 获取历史文档路径
 * @param e: 事件
 * @return: 历史文档路径
 */
export function getHistoryPath(e: Event): HistoryPath | void {
    const path = e.composedPath();
    for (let i = 0; i < path.length; ++i) {
        const element = path[i] as HTMLElement;
        const dataset = element.dataset;
        if (dataset) {
            switch (true) {
                case dataset.path && regexp.history.test(dataset.path):
                    if (dataset.type === "doc") {
                        return dataset.path;
                    }
                    break
                default:
                    break
            }
        }
    }
    return;
}

/**
 * 获取快照对象 ID
 * @param e: 事件
 * @return: 快照对象 ID 与快照原文件名/标题
 */
export function getSnapshotIDs(e: Event): { id: SnapshotID | void, id2: SnapshotID | void, name: string | void } {
    const path = e.composedPath();
    for (let i = 0; i < path.length; ++i) {
        const element = path[i] as HTMLElement;
        const dataset = element.dataset;
        if (dataset) {
            switch (true) {
                case dataset.id && regexp.snapshot.test(dataset.id):
                    if (element
                        ?.parentElement
                        ?.parentElement
                        ?.parentElement
                        ?.classList
                        ?.contains
                        ?.("history__diff") // 快照对比面板
                    ) {
                        return {
                            id: dataset.id, // 较早的快照
                            id2: dataset.id2, // 较晚的快照
                            name: (element.firstElementChild as HTMLElement)?.innerText, // 文件名/文档标题
                        };
                    }
                    break
                default:
                    break
            }
        }
    }
    return {
        id: undefined,
        id2: undefined,
        name: undefined,
    };
}

/**
 * 更新块 DOM 中的 ID
 */
export function updateBlockID(
    html: string,
    Lute: typeof siyuan.Lute = globalThis.Lute,
): string {
    const element = document.createElement("div");
    element.innerHTML = html;
    element
        .querySelectorAll<HTMLDivElement>("div[data-node-id]")
        ?.forEach(block => block.dataset.nodeId = Lute.NewNodeID());
    return element.innerHTML;
}

/**
 * 判断一个元素是否为思源块元素
 * @param element 元素
 * @returns 是否为思源块元素
 */
export function isSiyuanBlock(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.dataset.type
        && element.dataset.nodeId
        && regexp.id.test(element.dataset.nodeId)
    );
}

/**
 * 判断一个元素是否为思源文档背景
 * @param element 元素
 * @returns 是否为思源文档背景
 */
export function isSiyuanDocumentBackground(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.classList.contains("protyle-background")
        && element.dataset.nodeId
        && regexp.id.test(element.dataset.nodeId)
    );
}

/**
 * 判断一个元素是否为思源文档标题
 * @param element 元素
 * @returns 是否为思源文档标题
 */
export function isSiyuanDocumentTitle(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.classList.contains("protyle-title")
        && element.dataset.nodeId
        && regexp.id.test(element.dataset.nodeId)
    );
}

/**
 * 判断一个元素是否为思源文档块元素
 * @param element 元素
 * @returns 是否为思源文档块元素
 */
export function isSiyuanDocument(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.classList.contains("protyle-wysiwyg")
    );
}

/**
 * 判断一个元素是否为思源顶层元素
 * @param element 元素
 * @returns 是否为思源文档块元素
 */
export function isSiyuanTopBlock(element: any): boolean {
    return !!(isSiyuanBlock(element)
        && element instanceof HTMLElement
        && isSiyuanDocument(element.parentElement)
    );
}

/**
 * 获取所有选择的块
 * @returns 所有选择的块的 HTML 元素列表
 */
export function getSelectedBlocks(): HTMLElement[] {
    return Array.from(document.querySelectorAll(".protyle-wysiwyg div.protyle-wysiwyg--select[data-node-id]"));
}

/**
 * 获取当前光标所在的块
 * @returns 当前光标所在的块的 HTML 元素
 */
export function getCurrentBlock(): HTMLElement | null | undefined {
    const selection = document.getSelection();
    var element = selection?.focusNode?.parentElement;
    while (element // 元素存在
        && !isSiyuanBlock(element) // 元素非思源块元素
    ) {
        element = element.parentElement;
    }
    return element;
}

/**
 * 获取当前光标所在块的块 ID
 * @returns 当前光标所在块的块 ID
 */
export function getCurrentBlockID(): BlockID | void {
    const block = getCurrentBlock();
    return block?.dataset.nodeId;
}

/**
 * 获取活跃的块
 * 获取所选块或当前块
 * @returns 当前活跃的块的 HTMLElement 列表, 若不存在则
 */
export function getActiveBlocks(): HTMLElement[] {
    const blocks = getSelectedBlocks();
    if (blocks.length > 0) {
        return blocks;
    }
    else {
        const block = getCurrentBlock();
        if (block) return [block];
        else return [];
    }
}

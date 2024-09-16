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

import regexp from "./../regexp";

import type siyuan from "siyuan";

import type {
    BlockID,
    HistoryCreated,
    HistoryPath,
    ISiyuanGlobal,
    ShorthandID,
    SnapshotID,
    SnippetID,
} from "@workspace/types/siyuan";

declare let globalThis: ISiyuanGlobal;

/**
 * 查询块节点 ID
 * @param e - 事件
 * @returns ID
 */
export function getNodeID(e: Event): BlockID | void {
    const path = e.composedPath();
    for (let i = 0; i < path.length; ++i) {
        const electron = path[i] as HTMLElement;
        const dataset = electron.dataset;
        if (dataset) {
            switch (true) {
                // eslint-disable-next-line ts/no-use-before-define
                case isSiyuanBlock(electron):
                    return dataset.nodeId;

                default:
                    break;
            }
        }
    }
}

/**
 * 查询块 ID
 * @param e - 事件
 * @returns 块 ID
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
                case dataset.avId && regexp.id.test(dataset.avId):
                    return dataset.avId;
                case dataset.colId && regexp.id.test(dataset.colId):
                    return dataset.colId;
                case dataset.rootId && regexp.id.test(dataset.rootId):
                    return dataset.rootId;

                default:
                    break;
            }
        }
    }
}

/**
 * 获取代码片段 ID
 * @param e - 事件
 * @returns 收集箱 ID
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
                    break;
                default:
                    break;
            }
        }
    }
}

/**
 * 获取收集箱项 ID
 * @param e - 事件
 * @returns 收集箱 ID
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
                    break;
                default:
                    break;
            }
        }
    }
}

/**
 * 获取文档历史创建时间
 * @param e - 事件
 * @returns 文档历史创建时间
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
                    break;
                default:
                    break;
            }
        }
    }
}

/**
 * 获取历史文档路径
 * @param e - 事件
 * @returns 历史文档路径
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
                    break;
                default:
                    break;
            }
        }
    }
}

/**
 * 获取快照对象 ID
 * @param e - 事件
 * @returns 快照对象 ID 与快照原文件名/标题
 */
export function getSnapshotIDs(e: Event): {
    id?: SnapshotID;
    id2?: SnapshotID;
    name?: string;
} {
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
                            name: (element.firstElementChild as HTMLElement)?.textContent ?? undefined, // 文件名/文档标题
                        };
                    }
                    break;
                default:
                    break;
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
        ?.forEach((block) => block.dataset.nodeId = Lute.NewNodeID());
    return element.innerHTML;
}

/**
 * 判断一个元素是否为思源块元素
 * @param element -元素
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
 * @param element -元素
 * @returns 是否为思源文档背景
 */
export function isSiyuanProtyleBackground(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.classList.contains("protyle-background")
        && element.dataset.nodeId
        && regexp.id.test(element.dataset.nodeId)
    );
}
/**
 * @see {@link isSiyuanProtyleBackground}
 */
export const isSiyuanDocumentBackground = isSiyuanProtyleBackground;

/**
 * 判断一个元素是否为思源文档标题
 * @param element -元素
 * @returns 是否为思源文档标题
 */
export function isSiyuanProtyleTitle(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.classList.contains("protyle-title")
        && element.dataset.nodeId
        && regexp.id.test(element.dataset.nodeId)
    );
}
/**
 * @see {@link isSiyuanProtyleTitle}
 */
export const isSiyuanDocumentTitle = isSiyuanProtyleTitle;

/**
 * 判断一个元素是否为思源文档块元素
 * @param element -元素
 * @returns 是否为思源文档块元素
 */
export function isSiyuanProtyleWysiwyg(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.classList.contains("protyle-wysiwyg")
    );
}
/**
 * @see {@link isSiyuanProtyleWysiwyg}
 */
export const isSiyuanDocument = isSiyuanProtyleWysiwyg;

/**
 * 判断一个元素是否为思源编辑器面板
 * @param element -元素
 * @returns 是否为思源编辑器面板
 */
export function isSiyuanProtyleContent(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.classList.contains("protyle-content")
    );
}

/**
 * 判断一个元素是否为思源顶层元素
 * @param element -元素
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
    let element = selection?.focusNode;
    while (element // 元素存在
        && (!(element instanceof HTMLElement) // 元素非 HTMLElement
            || !isSiyuanBlock(element) // 元素非思源块元素
        )
    ) {
        element = element.parentElement;
    }
    return element;
}

/**
 * 获取当前光标所在的文档
 */

/**
 * 获取当前光标所在块的块 ID
 * @returns 当前光标所在块的块 ID
 */
export function getCurrentBlockID(): BlockID | void {
    const block = getCurrentBlock();
    return block?.dataset.nodeId;
}

/**
 * 获取当前光标所在编辑器 (所见即所得)
 * @returns 当前光标所在的编辑器的 HTML 元素
 */
export function getCurrentProtyleWysiwyg(): HTMLElement | null {
    let element = globalThis.document.activeElement;
    while (element // 元素存在
        && (!(element instanceof HTMLElement) // 元素非 HTMLElement
            || !isSiyuanDocument(element) // 元素非思源编辑器元素
        )
    ) {
        element = element.parentElement;
    }
    return element;
}

/**
 * 获取当前光标所在编辑器的面板
 * @returns 当前光标所在的编辑器的 HTML 元素
 */
export function getCurrentProtyleContent(): HTMLElement | null | undefined {
    const wysiwyg = getCurrentProtyleWysiwyg();
    return isSiyuanProtyleContent(wysiwyg?.parentElement)
        ? wysiwyg?.parentElement
        : undefined;
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
        if (block)
            return [block];
        else return [];
    }
}

export interface ICodeBlockCursorPosition {
    code: string; // 代码

    row: number; // 行号
    column: number; // 列号
    offset: number; // 偏移量

    container: HTMLElement; // 代码块容器
    selection: Selection; // 光标所在的 Selection
    order: boolean; // 划选顺序是否为从前往后

    before: Range; // 划选前的 Range
    current: Range; // 划选的 Range
    after: Range; // 划选后的 Range

    prefix: Range; // 光标所在位置前的 Range
    suffix: Range; // 光标所在位置后的 Range
}

/**
 * 获取代码块容器元素
 * @param element -代码块内的元素
 * @returns 代码块容器元素
 */
export function getCodeBlockContainer(element = globalThis.document.getSelection()?.focusNode): HTMLElement | null | undefined {
    while (element // 元素存在
        && (!(element instanceof HTMLElement) // 元素非 HTMLElement
            || !element.classList.contains("hljs") // 元素非代码块容器
        )
    ) {
        element = element.parentElement;
    }
    return element;
}

/**
 * 获取代码块光标所在位置
 * @returns 光标位置
 */
export function getCodeBlockCursorPosition(): ICodeBlockCursorPosition | void {
    const selection = globalThis.document.getSelection(); // 获取光标
    if (selection?.rangeCount === 1) { // 存在光标
        const current = selection.getRangeAt(0); // 获取光标选择内容
        const container = getCodeBlockContainer(current.commonAncestorContainer);
        if (container) { // 光标所选内容位于代码块内
            const code = container.textContent ?? ""; // 代码块内容
            const before = globalThis.document.createRange(); // 光标选择前的范围
            const after = globalThis.document.createRange(); // 光标选择后的范围
            const prefix = globalThis.document.createRange(); // 光标所在位置之前的范围
            const suffix = globalThis.document.createRange(); // 光标所在位置之后的范围

            const {
                anchorNode,
                anchorOffset,
                focusNode,
                focusOffset,
            } = selection;
            if (anchorNode && focusNode && container.firstChild && container.lastChild) { // 光标选择的起点与终点存在, 代码块容器起点与终点存在
                /**
                 * 判断起点与终点的顺序
                 * - `true`: 起点在终点之前
                 * - `false`: 起点在终点之后
                 * REF: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/compareDocumentPosition
                 */
                const order = anchorNode === focusNode // 位于同一个元素内, 等价于 anchorNode.compareDocumentPosition(focusNode) === 0
                    ? anchorOffset <= focusOffset // 根据 offset 判断光标起点与终点的顺序
                    : (!!(anchorNode.compareDocumentPosition(focusNode) & Node.DOCUMENT_POSITION_FOLLOWING)
                        );

                before.setStartBefore(container.firstChild);
                after.setEndAfter(container.lastChild);

                prefix.setStartBefore(container.firstChild);
                suffix.setEndAfter(container.lastChild);
                if (order) { // 起点在终点之前
                    before.setEnd(anchorNode, anchorOffset); // 设置光标选择范围 前方的终点
                    after.setStart(focusNode, focusOffset); // 设置光标选择范围 后方的起点
                }
                else { // 起点在终点之后
                    before.setEnd(focusNode, focusOffset); // 设置光标选择范围 前方的终点
                    after.setStart(anchorNode, anchorOffset); // 设置光标选择范围 后方的起点
                }

                prefix.setEnd(focusNode, focusOffset); // 设置光标选择范围 前方的终点
                suffix.setStart(focusNode, focusOffset); // 设置光标选择范围 后方的起点

                const prefix_code = prefix.toString(); // 光标所在位置之前的代码
                const lines = prefix_code.split("\n"); // 光标所在位置之前的代码的行
                const line = lines.at(-1)!; // 光标所在位置之前 (当前行) 代码

                const row = lines.length; // 光标所在位置的代码的行数
                const column = line.length; // 光标所在位置的代码的列数
                const offset = prefix_code.length; // 光标所在位置的代码的偏移量

                return {
                    code,
                    row,
                    column,
                    offset,
                    container,
                    selection,
                    order,
                    before,
                    current,
                    after,
                    prefix,
                    suffix,
                };
            }
        }
    }
}

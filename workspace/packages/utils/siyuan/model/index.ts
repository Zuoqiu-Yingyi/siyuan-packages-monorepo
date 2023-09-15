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

import type siyuan from "siyuan";
import type { IProtyle } from "@workspace/types/siyuan/protyle";
import type { ISiyuanGlobal } from "@workspace/types/siyuan";

declare var globalThis: ISiyuanGlobal;

export interface IApp {
    plugins: InstanceType<typeof siyuan.Plugin>[];
}

export interface IBaseModel {
    app: IApp;
    element: HTMLDivElement;
    parent: any;
}

export interface IEditor {
    version: string;
    protyle: IProtyle;
}

export interface IEditorModel extends IBaseModel {
    editor: IEditor;
    headElement: HTMLLIElement;
}

export interface IPdfModel extends IBaseModel {
    path: string;
    pdfId: string;
    pdfPage: number;
    pdfObject: any;
}

export type TModel = IEditorModel | IPdfModel;

/**
 * 获取页面内的编辑器
 * @param globalSiyuan 思源全局变量
 * @returns 编辑器列表
 */
export function getEditorsFromLayout(globalSiyuan = globalThis.siyuan): IEditor[] {
    const editors: IEditor[] = [];

    /* 移动端编辑器 */
    if (globalSiyuan?.mobile?.editor) {
        editors.push(globalSiyuan.mobile.editor);
    }

    /* 桌面端编辑器 */
    if (globalSiyuan?.layout?.centerLayout) {
        const layouts = [];
        layouts.push(globalSiyuan.layout.centerLayout);
        while (layouts.length > 0) {
            const layout = layouts.pop();
            if (layout.children.length > 0) {
                for (let child of layout.children) {
                    if (child.model?.editor) editors.push(child.model.editor);
                    else if (child.children) layouts.push(child);
                }
            }
        }
    }

    return editors;
}

/**
 * 获取悬浮窗口的编辑器
 * @param globalSiyuan 思源全局变量
 * @returns 编辑器列表
 */
export function getEditorsFromBlockPanels(globalSiyuan = globalThis.siyuan): IEditor[] {
    const editors: IEditor[] = [];
    for (const blockPanel of globalSiyuan.blockPanels) {
        for (const editor of blockPanel.editors) {
            editors.push(editor);
        }
    }
    return editors;
}

/**
 * 获取所有加载完成的编辑器
 * @param globalSiyuan 思源全局变量
 * @returns 编辑器列表
 */
export function getEditors(globalSiyuan = globalThis.siyuan): IEditor[] {
    const editors: IEditor[] = [
        ...getEditorsFromLayout(globalSiyuan),
        ...getEditorsFromBlockPanels(globalSiyuan),
    ];
    return editors;
}

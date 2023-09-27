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

export type BlockID = string; // 块 ID
export type SnippetID = string; // 代码片段 ID
export type SnapshotID = string; // 快照对象 ID
export type ShorthandID = string; // 收集箱项 ID
export type HistoryPath = string; // 历史文档路径
export type HistoryCreated = string; // 文档历史创建时间

export type openTabParameters = Parameters<siyuan.openTab>;
export type openTabParametersOptions = openTabParameters[0];
export type openTabParametersOptionsCustom = openTabParametersOptions.custom;

export interface ISiyuan {
}

export interface ISiyuanVariable {
    /* Siyuan */
    Lute: typeof siyuan.Lute;
    siyuan: any;
    pdfjsLib: typeof import("pdfjs-dist");

    ABCJS?: typeof import("abcjs");
    Viewer?: typeof import("viewerjs").default;
    Viz?: typeof import("viz.js");
    echarts?: typeof import("echarts");
    hljs?: import("highlight.js").HLJSApi;
    katex?: typeof import("katex");
    mermaid?: typeof import("mermaid").default;
    plantumlEncoder?: typeof import("plantuml-encoder");
}

export interface ISiyuanElectron {
    /* Electron */
    require: Function;
    process: NodeJS.Process;

    __filename: string;
    __dirname: string;

    require: NodeRequire;
    module: NodeModule;
}

export interface ISiyuanExtends extends ISiyuanVariable, Partial<ISiyuanElectron> { }

export interface ISiyuanGlobal extends ISiyuanExtends, Window { }

declare var globalThis: ISiyuanGlobal;

declare global {
    interface Window extends ISiyuanExtends {
    }
    interface globalThis extends ISiyuanExtends {
    }
}

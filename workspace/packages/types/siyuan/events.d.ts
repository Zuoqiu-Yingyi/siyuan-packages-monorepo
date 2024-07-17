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

import type siyuan from "siyuan";

export interface IWebSocketMainEvent extends CustomEvent<siyuan.IEventBusMap["ws-main"]> {
    // type: "ws-main";
}

export interface IClickBlockIconEvent extends CustomEvent<siyuan.IEventBusMap["click-blockicon"]> {
    // type: "click-blockicon";
}

export interface IClickEditorTitleIconEvent extends CustomEvent<siyuan.IEventBusMap["click-editortitleicon"]> {
    // type: "click-editorcontent";
}

export interface IClickEditorContentEvent extends CustomEvent<siyuan.IEventBusMap["click-editorcontent"]> {
    // type: "click-editorcontent";
}

export interface IOpenMenuFileAnnotationRefEvent extends CustomEvent<siyuan.IEventBusMap["open-menu-fileannotationref"]> {
    // type: "open-menu-fileannotationref";
}

export interface IOpenMenuImageEvent extends CustomEvent<siyuan.IEventBusMap["open-menu-image"]> {
    // type: "open-menu-image";
}

export interface IOpenMenuLinkEvent extends CustomEvent<siyuan.IEventBusMap["open-menu-link"]> {
    // type: "open-menu-link";
}

export interface IOpenMenuBlockRefEvent extends CustomEvent<siyuan.IEventBusMap["open-menu-blockref"]> {
    // type: "open-menu-blockref";
}

export interface IOpenMenuContentEvent extends CustomEvent<siyuan.IEventBusMap["open-menu-content"]> {
    // type: "open-menu-content";
}

export interface IOpenMenuDocTreeEvent extends CustomEvent<siyuan.IEventBusMap["open-menu-doctree"]> {
    // type: "open-menu-content";
}

export interface IOpenMenuInboxEvent extends CustomEvent<siyuan.IEventBusMap["open-menu-inbox"]> {
    // type: "open-menu-inbox";
}

export interface IOpenSiyuanUrlEvent extends CustomEvent<siyuan.IEventBusMap["open-siyuan-url"]> {
    // type: "open-siyuan-url";
}

export interface IOpenSiyuanUrlBlockEvent extends CustomEvent<siyuan.IEventBusMap["open-siyuan-url-block"]> {
    // type: "open-siyuan-url-block";
}

export interface IOpenSiyuanUrlPluginEvent extends CustomEvent<siyuan.IEventBusMap["open-siyuan-url-plugin"]> {
    // type: "open-siyuan-url-plugin";
}

export interface ILoadedProtyleStaticEvent extends CustomEvent<siyuan.IEventBusMap["loaded-protyle-static"]> {
    // type: "loaded-protyle";
}

export interface ILoadedProtyleDynamicEvent extends CustomEvent<siyuan.IEventBusMap["loaded-protyle-dynamic"]> {
    // type: "loaded-protyle-dynamic";
}

export interface ISwitchProtyleEvent extends CustomEvent<siyuan.IEventBusMap["switch-protyle"]> {
    // type: "switch-protyle";
}

export interface IDestroyProtyleEvent extends CustomEvent<siyuan.IEventBusMap["destroy-protyle"]> {
    // type: "destroy-protyle";
}

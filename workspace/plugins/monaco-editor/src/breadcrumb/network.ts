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

import {
    get,
    type Writable,
} from "svelte/store";

import { TooltipsDirection } from "@workspace/components/siyuan/misc/tooltips";

import {
    Breadcrumb,
    type IBaseBreadcrumbOptions,
    type IBaseStore,
    type IBreadcrumb,
} from "./breadcrumb";

import type { ComponentProps } from "svelte";

import type Tab from "@workspace/components/siyuan/tab/Tab.svelte";

export interface INetworkStore extends IBaseStore {
    fullscreen: Writable<ComponentProps<Tab>["fullscreen"]>; // 是否全屏显示
}

export interface INetworkBreadcrumbOptions extends IBaseBreadcrumbOptions {
    uri: string; // 资源路径
    stores?: INetworkStore; // 响应式数据
}

export class NetworkBreadcrumb extends Breadcrumb {
    public async makeBreadcrumb(options: INetworkBreadcrumbOptions): Promise<IBreadcrumb> {
        const { uri } = options;
        const url = new URL(uri);

        const breadcrumb: IBreadcrumb = {
            breadcrumb: true,
            breadcrumbItems: [],
            breadcrumbIcons: [],
        };

        const paths: string[] = [];
        paths.push(`${url.protocol}\/`);
        breadcrumb.breadcrumbItems.push({
            type: "item",
            text: `${url.protocol}\/\/`,
            textTitle: paths.join("/"),
            textEllipsis: false,
        }, {
            type: "arrow",
            icon: "#icon-monaco-editor-slash",
        });
        paths.push(url.host);
        breadcrumb.breadcrumbItems.push({
            type: "item",
            text: paths[1],
            textTitle: paths.join("/"),
            textEllipsis: false,
            active: true,
        });
        url.pathname.split("/").forEach((p) => {
            if (p) {
                paths.push(p);
                breadcrumb.breadcrumbItems.push({
                    type: "arrow",
                    icon: "#icon-monaco-editor-slash",
                }, {
                    type: "item",
                    text: p,
                    textTitle: paths.join("/"),
                    textEllipsis: false,
                });
            }
        });

        /* 当前文件对应的面包屑显示为激活状态 */
        Breadcrumb.setLastBreadcrumbItemActive(breadcrumb);

        if (options.stores) {
            /* 全屏 */
            breadcrumb.breadcrumbIcons.push({
                icon: "#iconFullscreen",
                type: "fullscreen",
                ariaLabel: this.i18n.button.fullscreen.ariaLabel,
                tooltipsDirection: TooltipsDirection.sw,
                onClick(_e, _element, props) {
                    const fullscreen = get(props.active!);
                    options.stores!.fullscreen!.set(!fullscreen);
                    props.active!.set(!fullscreen);
                },
            });

            // TODO: 在新窗口打开
        }
        return breadcrumb;
    }
}

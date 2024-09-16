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
import { staticPathname2WorkspacePath } from "@workspace/utils/siyuan/url";

import {
    Breadcrumb,
    type IBaseBreadcrumbOptions,
    type IBaseStore,
    type IBreadcrumb,
} from "./breadcrumb";

import type { ComponentProps } from "svelte";

import type Tab from "@workspace/components/siyuan/tab/Tab.svelte";

export interface IAssetStore extends IBaseStore {
    fullscreen: Writable<ComponentProps<Tab>["fullscreen"]>; // 是否全屏显示
}

export type IAssetBreadcrumbOptions = IAssetBreadcrumbOptions1 | IAssetBreadcrumbOptions2;

export interface IAssetBreadcrumbBaseOptions extends IBaseBreadcrumbOptions {
    stores?: IAssetStore; // 响应式数据
}

export interface IAssetBreadcrumbOptions1 extends IAssetBreadcrumbBaseOptions {
    pathname: string; // 资源 URL 路径
    path?: never;
}

export interface IAssetBreadcrumbOptions2 extends IAssetBreadcrumbBaseOptions {
    pathname?: never;
    path: string; // 相对于工作空间目录的路径
}

export class AssetBreadcrumb extends Breadcrumb {
    public async makeBreadcrumb(options: IAssetBreadcrumbOptions): Promise<IBreadcrumb> {
        const breadcrumb: IBreadcrumb = {
            breadcrumb: true,
            breadcrumbItems: [],
            breadcrumbIcons: [],
        };

        /* 获得相对于工作空间目录的路径 */
        const path = options.path ?? staticPathname2WorkspacePath(options.pathname);
        const paths: string[] = [];
        paths.push(...window.siyuan.config.system.workspaceDir.replaceAll("\\", "/").split("/"));
        breadcrumb.breadcrumbItems.push({
            type: "item",
            icon: "#iconWorkspace",
            text: this.i18n.button.workspace.text,
            textTitle: paths.join("/"),
            textEllipsis: true,
        });
        path.split("/").forEach((p) => {
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
        });

        /* 当前文件对应的面包屑显示为激活状态 */
        Breadcrumb.setLastBreadcrumbItemActive(breadcrumb);

        if (options.stores) {
            /* 实时更新 */
            breadcrumb.breadcrumbIcons.push({
                icon: "#iconRefresh",
                type: "refresh",
                ariaLabel: this.i18n.button.realTime.ariaLabel,
                tooltipsDirection: TooltipsDirection.sw,
                onClick(_e, _element, props) {
                    const changeable = get(props.active!);
                    options.stores!.changeable!.set(!changeable);
                    props.active!.set(!changeable);
                },
            });

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

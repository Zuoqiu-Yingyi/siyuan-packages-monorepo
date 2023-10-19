<!--
 Copyright (C) 2023 Zuoqiu Yingyi
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script
    lang="ts"
    context="module"
>
    import type { ISiyuanGlobal } from "@workspace/types/siyuan";
    declare var globalThis: ISiyuanGlobal;
</script>

<script lang="ts">
    import type { ComponentProps } from "svelte";
    import { get } from "svelte/store";

    import Tab from "./Tab.svelte";
    import Iframe from "./../misc/Iframe.svelte";
    import { TooltipsDirection } from "./../misc/tooltips";
    import { src2url } from "@workspace/utils/misc/url";
    import { copyText } from "@workspace/utils/misc/copy";

    export let src: ComponentProps<Iframe>["src"]; // iframe 资源
    export let title: ComponentProps<Iframe>["title"]; // iframe 标题

    /* 响应式数据 */
    let fullscreen = false;
    let breadcrumb: ComponentProps<Tab>["breadcrumb"] = true;
    let breadcrumbItems: ComponentProps<Tab>["breadcrumbItems"] = [];
    let breadcrumbIcons: ComponentProps<Tab>["breadcrumbIcons"] = [
        {
            icon: "#iconCopy",
            type: "copy",
            ariaLabel: globalThis.siyuan?.languages?.copy,
            tooltipsDirection: TooltipsDirection.sw,
            onClick(_e, _element, _props) {
                copyText(url.href);
            },
        },
        {
            icon: "#iconOpenWindow",
            type: "open",
            ariaLabel: globalThis.siyuan?.languages?.useBrowserView,
            tooltipsDirection: TooltipsDirection.sw,
            onClick(_e, _element, _props) {
                globalThis.open(src);
            },
        },
        {
            icon: "#iconFullscreen",
            type: "fullscreen",
            ariaLabel: globalThis.siyuan?.languages?.fullscreen,
            tooltipsDirection: TooltipsDirection.sw,
            onClick(_e, _element, props) {
                const active = (props.active && get(props.active)) ?? fullscreen;
                fullscreen = !active;
                props.active?.set(fullscreen);
            },
        },
    ];

    function updateBreadCrumb(url: URL): void {
        const paths: string[] = [];
        const items: ComponentProps<Tab>["breadcrumbItems"] = [];

        /* 协议 */
        paths.push(`${url.protocol}//`);
        items.push(
            {
                type: "item",
                get icon(): string {
                    switch (url.protocol) {
                        case "https:":
                        case "ftps:":
                            return "#iconLock";

                        case "http:":
                        case "ftp:":
                            return "#iconUnlock";

                        default:
                            return "#iconHelp";
                    }
                },
                text: `${url.protocol}//`,
                textTitle: paths.join(""),
                textEllipsis: false,
            },
            {
                type: "arrow",
            },
        );

        /* 主机 */
        paths.push(url.host);
        items.push({
            type: "item",
            get icon(): string {
                return url.origin === location.origin //
                    ? "#iconSiYuan"
                    : "#iconLanguage";
            },
            text: url.host,
            textTitle: paths.join(""),
            textEllipsis: false,
            active: true,
        });

        /* 路径 */
        url.pathname.split("/").forEach((path, index) => {
            if (path) {
                paths.push(`/${path}`);
                items.push(
                    {
                        type: "arrow",
                        icon: "#icon-keepass-slash",
                    },
                    {
                        type: "item",
                        icon:
                            index !== 1
                                ? undefined
                                : (() => {
                                      switch (path) {
                                          case "stage":
                                              return "#iconFolder";
                                          case "appearance":
                                              return "#iconTheme";
                                          case "export":
                                              return "#iconUpload";
                                          case "history":
                                              return "#iconHistory";
                                          case "assets":
                                              return "#iconImage";
                                          case "emojies":
                                              return "#iconEmoji";
                                          case "plugins":
                                              return "#iconPlugin";
                                          case "public":
                                              return "#iconOpenWindow";
                                          case "snippets":
                                              return "#iconCode";
                                          case "templates":
                                              return "#iconMarkdown";
                                          case "widgets":
                                              return "#iconBoth";
                                          default:
                                              return "#iconHelp";
                                      }
                                  })(),
                        text: path,
                        textTitle: paths.join(""),
                        textEllipsis: false,
                    },
                );
            }
        });

        /* 查询参数 */
        if (url.search) {
            paths.push(url.search);
            items.push(
                {
                    type: "arrow",
                },
                {
                    type: "item",
                    text: url.search,
                    textTitle: paths.join(""),
                    textEllipsis: false,
                    active: false,
                },
            );
        }

        /* 片段 */
        if (url.hash) {
            paths.push(url.hash);
            items.push(
                {
                    type: "arrow",
                },
                {
                    type: "item",
                    text: url.hash,
                    textTitle: paths.join(""),
                    textEllipsis: false,
                    active: false,
                },
            );
        }

        /* 搜索参数 */
        breadcrumbItems = items;
    }

    $: url = src2url(src);
    $: updateBreadCrumb(url);
</script>

<Tab
    {fullscreen}
    {breadcrumb}
    {breadcrumbItems}
    {breadcrumbIcons}
>
    <Iframe
        {src}
        {title}
        slot="content"
    />
</Tab>

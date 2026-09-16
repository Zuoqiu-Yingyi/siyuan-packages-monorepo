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
    module
>
    import type { IProps as IIframeProps } from "./../misc/Iframe.svelte";

    export interface IProps {
        src?: IIframeProps["src"]; // iframe 资源
        title?: IIframeProps["title"]; // iframe 标题
    }

    export type TProps = IProps;
</script>

<script lang="ts">
    import { get } from "svelte/store";

    import { copyText } from "@workspace/utils/misc/copy";
    import { src2url } from "@workspace/utils/misc/url";
    import { path2icon } from "@workspace/utils/siyuan/icon";

    import { TooltipsDirection } from "./../misc/tooltips";

    import Iframe from "./../misc/Iframe.svelte";
    import Tab from "./Tab.svelte";

    import type { IEvent as IIframeEvent } from "./../misc/Iframe.svelte";
    import type { IProps as ITabProps } from "./Tab.svelte";

    let {
        src = $bindable(),
        title,
    }: TProps = $props();

    const url = $derived(src2url(src as string));

    /* 响应式数据 */
    let iframe: HTMLIFrameElement | undefined = $state();
    let fullscreen = $state(false);
    const breadcrumb: ITabProps["breadcrumb"] = true;
    const breadcrumbIcons: ITabProps["breadcrumbIcons"] = [
        {
            icon: "#iconCopy",
            type: "copy",
            ariaLabel: window.siyuan?.languages?.copy,
            tooltipsDirection: TooltipsDirection.sw,
            onClick(_e, _element, _props) {
                copyText(url.href);
            },
        },
        {
            icon: "#iconRefresh",
            type: "refresh",
            ariaLabel: window.siyuan?.languages?.refresh,
            tooltipsDirection: TooltipsDirection.sw,
            onClick(_e, _element, _props) {
                if (iframe?.contentWindow?.location?.reload) {
                    iframe.contentWindow.location.reload();
                }
                else {
                    src = src;
                }
            },
        },
        {
            icon: "#iconOpenWindow",
            type: "open",
            ariaLabel: window.siyuan?.languages?.useBrowserView,
            tooltipsDirection: TooltipsDirection.sw,
            onClick(_e, _element, _props) {
                window.open(src);
            },
        },
        {
            icon: "#iconFullscreen",
            type: "fullscreen",
            ariaLabel: window.siyuan?.languages?.fullscreen,
            tooltipsDirection: TooltipsDirection.sw,
            onClick(_e, _element, props) {
                const active = (props.active && get(props.active)) ?? fullscreen;
                fullscreen = !active;
                props.active?.set(fullscreen);
            },
        },
    ];

    function buildBreadcrumbItems(url: URL): NonNullable<ITabProps["breadcrumbItems"]> {
        const paths: string[] = [];
        const items: NonNullable<ITabProps["breadcrumbItems"]> = [];
        const flag_location = url.origin === location.origin;

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
                return flag_location //
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
                        icon: index === 1 && flag_location ? `#${path2icon(path)}` : undefined,
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

        return items;
    }

    const breadcrumbItems = $derived(buildBreadcrumbItems(url));

    function onCreate(params: IIframeEvent): void {
        iframe = params.iframe;
    }

    function onDestroy(): void {
        iframe = undefined;
    }
</script>

<Tab
    {breadcrumb}
    {breadcrumbIcons}
    {breadcrumbItems}
    {fullscreen}
>
    {#snippet content()}
        <Iframe
            {onCreate}
            {onDestroy}
            {src}
            {title}
        />
    {/snippet}
</Tab>

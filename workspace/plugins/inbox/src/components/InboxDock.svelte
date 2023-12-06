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
    context="module"
    lang="ts"
>
    import type { ISiyuanGlobal } from "@workspace/types/siyuan";
    declare var globalThis: ISiyuanGlobal;
</script>

<script lang="ts">
    import Bar from "@workspace/components/siyuan/dock/Bar.svelte";
    import Iframe from "@workspace/components/siyuan/misc/Iframe.svelte";
    import { TooltipsDirection } from "@workspace/components/siyuan/misc/tooltips";

    import type { IBar } from "@workspace/components/siyuan/dock/index";
    import type InboxPlugin from "@/index";
    import { trimPrefix } from "@workspace/utils/misc/string";

    export let plugin: InstanceType<typeof InboxPlugin>; // 插件对象
    export let src: string; // iframe 资源路径

    const url = new URL(src, globalThis.document.baseURI);

    /* 标题栏配置 */
    const bar: IBar = {
        logo: "#icon-inbox",
        title: plugin.displayName,
        icons: [
            {
                // 刷新
                icon: "#iconRefresh",
                type: "refresh",
                ariaLabel: `${globalThis.siyuan.languages.refresh}`,
                tooltipsDirection: TooltipsDirection.sw,
                onClick: async (_e, _element, _props) => {
                    url.searchParams.set("t", Date.now().toString());
                    src = trimPrefix(url.href, globalThis.document.baseURI);
                },
            },
            {
                // 最小化
                icon: "#iconMin",
                type: "min",
                ariaLabel: `${globalThis.siyuan.languages.min} ${plugin.siyuan.adaptHotkey("⌘W")}`,
                tooltipsDirection: TooltipsDirection.sw,
            },
        ],
    };
</script>

<Bar {...bar} />
<Iframe
    {src}
    title={plugin.displayName}
/>

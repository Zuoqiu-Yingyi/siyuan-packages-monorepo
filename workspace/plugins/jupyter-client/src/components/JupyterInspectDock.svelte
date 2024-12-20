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

<script lang="ts">
    import Bar from "@workspace/components/siyuan/dock/Bar.svelte";
    import { TooltipsDirection } from "@workspace/components/siyuan/misc/tooltips";

    import type { IBar } from "@workspace/components/siyuan/dock/index";

    import type JupyterClientPlugin from "@/index";

    import type { XtermOutputElement } from "./XtermOutputElement";

    /* 标题栏配置 */
    interface IProps {
        stream: string; // 使用 base64 编码的数据流
        plugin: InstanceType<typeof JupyterClientPlugin>; // 插件实例
    }

    const {
        stream = "",
        plugin,
    }: IProps = $props();

    let xterm: XtermOutputElement;

    const bar: IBar = {
        logo: "#icon-jupyter-client-inspect",
        title: plugin.i18n.inspectDock.title,
        icons: [
            {
                // 最小化
                icon: "#iconMin",
                type: "min",
                ariaLabel: `${window.siyuan.languages.min} ${plugin.siyuan.adaptHotkey("⌘W")}`,
                tooltipsDirection: TooltipsDirection.sw,
            },
        ],
    };
</script>

<Bar {...bar} />
<jupyter-xterm-output
    bind:this={xterm}
    class="xtrem fn__flex-1"
    data-stream={stream}
></jupyter-xterm-output>

<style lang="less">
    .xtrem {
        padding: 0.5em;
    }
</style>

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
    import { onDestroy, type ComponentEvents, type ComponentProps } from "svelte";
    import { writable, type Unsubscriber } from "svelte/store";

    import Tab from "@workspace/components/siyuan/tab/Tab.svelte";

    import { DEFAULT_VDITOR_PROPS } from "@/configs/vditor";
    import { Facade, type IFacadeAssetOptions, type ITabOptions } from "@/facades/facade";

    import VditorIframe from "./VditorIframe.svelte";

    import type { IAssetHandler } from "@/handlers/asset";

    export let plugin: ComponentProps<VditorIframe>["plugin"]; // 插件对象
    export let facadeOptions: IFacadeAssetOptions; // 门面参数

    export let assetsDirPath: ComponentProps<VditorIframe>["assetsDirPath"] = plugin.config.vditor.assetsDirPath; // 资源目录
    export let assetsUploadMode: ComponentProps<VditorIframe>["assetsUploadMode"] = plugin.config.vditor.assetsUploadMode; // 资源目录模式
    export let options: ComponentProps<VditorIframe>["options"] = plugin.config.vditor.options;

    let path: ComponentProps<VditorIframe>["path"];
    let value: ComponentProps<VditorIframe>["value"];
    const theme: ComponentProps<VditorIframe>["theme"] = DEFAULT_VDITOR_PROPS.theme;
    const codeBlockThemeLight: ComponentProps<VditorIframe>["codeBlockThemeLight"] = window.siyuan?.config?.appearance?.codeBlockThemeLight;
    const codeBlockThemeDark: ComponentProps<VditorIframe>["codeBlockThemeDark"] = window.siyuan?.config?.appearance?.codeBlockThemeDark;
    const updatable: ComponentProps<VditorIframe>["updatable"] = DEFAULT_VDITOR_PROPS.updatable;
    let changeable: ComponentProps<VditorIframe>["changeable"] = DEFAULT_VDITOR_PROPS.changeable;

    let fullscreen: ComponentProps<Tab>["fullscreen"] = false; // 是否为全屏模式

    let breadcrumb: ComponentProps<Tab>["breadcrumb"] = false; // 是否显示面包屑
    let breadcrumbItems: ComponentProps<Tab>["breadcrumbItems"] = []; // 面包屑项
    let breadcrumbIcons: ComponentProps<Tab>["breadcrumbIcons"] = []; // 面包屑按钮

    let tabOptions: ITabOptions;
    let inited: boolean = false;

    /* 响应式数据 */
    const stores = {
        changeable: writable(changeable),
        fullscreen: writable(fullscreen),
    };
    $: stores.changeable.set(changeable!);
    $: stores.fullscreen.set(fullscreen!);
    const unsubscribes: Unsubscriber[] = [
        stores.changeable.subscribe((v) => (changeable = v)), //
        stores.fullscreen.subscribe((v) => (fullscreen = v)), //
    ];
    onDestroy(() => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
    });

    /* 门店 */
    const facade = new Facade(plugin);
    $: facade.makeTabOptions(facadeOptions, stores).then((o) => (tabOptions = o));
    $: {
        if (tabOptions) {
            const handler = tabOptions.handler as IAssetHandler;
            path = handler.path;
            value = handler.modified.value;

            breadcrumb = tabOptions.breadcrumb.breadcrumb;
            breadcrumbItems = tabOptions.breadcrumb.breadcrumbItems;
            breadcrumbIcons = tabOptions.breadcrumb.breadcrumbIcons;

            inited = true;
        }
    }

    /* 保存内容 */
    function update(e: ComponentEvents<VditorIframe>["changed"] | ComponentEvents<VditorIframe>["save"]) {
        tabOptions?.handler?.update?.(e.detail.markdown);
    }

    /* 打开链接事件 */
    function openLink(e: ComponentEvents<VditorIframe>["open-link"]) {
        plugin.openLinkEventHandler(e.detail);
    }
</script>

<Tab
    {breadcrumb}
    {breadcrumbIcons}
    {breadcrumbItems}
    {fullscreen}
>
    <div
        slot="content"
        class="fn__flex fn__flex-1"
    >
        {#if inited}
            <VditorIframe
                {assetsDirPath}
                {assetsUploadMode}
                {changeable}
                {codeBlockThemeDark}
                {codeBlockThemeLight}
                {options}
                {path}
                {plugin}
                {theme}
                {updatable}
                {value}
                on:save={update}
                on:changed={update}
                on:open-link={openLink}
            />
        {/if}
    </div>
</Tab>

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

<!-- 设置面板 -->

<script lang="ts">
    import Panels from "@workspace/components/siyuan/setting/panel/Panels.svelte";
    import Panel from "@workspace/components/siyuan/setting/panel/Panel.svelte";
    import Tabs from "@workspace/components/siyuan/setting/tab/Tabs.svelte";
    import Item from "@workspace/components/siyuan/setting/item/Item.svelte";
    import Input from "@workspace/components/siyuan/setting/item/Input.svelte";

    import { ItemType } from "@workspace/components/siyuan/setting/item/item";
    import { type ITab } from "@workspace/components/siyuan/setting/tab";

    import type Plugin from "@/index";

    import type { IConfig } from "@/types/config";
    import type { I18N } from "@/utils/i18n";

    export let config: IConfig; // 传入的配置项
    export let plugin: InstanceType<typeof Plugin>; // 插件实例

    const i18n = plugin.i18n as unknown as I18N;

    async function updated() {
        await plugin.updateConfig(config);
    }

    function resetOptions() {
        plugin.siyuan.confirm(
            i18n.settings.generalSettings.reset.title, // 标题
            i18n.settings.generalSettings.reset.description, // 文本
            async () => {
                await plugin.resetConfig(); // 重置配置
                globalThis.location.reload(); // 刷新页面
            }, // 确认按钮回调
        );
    }

    enum PanelKey {
        general, // 常规设置
        keeweb, // KeeWeb 设置
    }

    enum TabKey {
        plugin, // 插件设置
        window, // 窗口设置
    }

    let panels_focus_key = PanelKey.general;
    const panels: ITab[] = [
        {
            key: PanelKey.general,
            text: i18n.settings.generalSettings.title,
            name: i18n.settings.generalSettings.title,
            icon: "#iconSettings",
        },
        {
            key: PanelKey.keeweb,
            text: i18n.settings.keewebSettings.title,
            name: i18n.settings.keewebSettings.title,
            icon: "#icon-keepass-keeweb",
        },
    ];

    let keeweb_settings_tabs_focus_key = TabKey.plugin;
    const tabs = {
        keeweb: [
            {
                key: TabKey.plugin,
                text: i18n.settings.keewebSettings.pluginTab.title,
                name: i18n.settings.keewebSettings.pluginTab.title,
                icon: "🧩",
            },
            {
                key: TabKey.window,
                text: i18n.settings.keewebSettings.windowTab.title,
                name: i18n.settings.keewebSettings.windowTab.title,
                icon: "🗔",
            },
        ] as ITab[],
    };
</script>

<Panels
    {panels}
    focus={panels_focus_key}
    let:focus={focusPanel}
>
    <!-- 常规设置面板 -->
    <Panel display={panels[0].key === focusPanel}>
        <!-- 重置设置 -->
        <Item
            title={i18n.settings.generalSettings.reset.title}
            text={i18n.settings.generalSettings.reset.description}
        >
            <Input
                slot="input"
                type={ItemType.button}
                settingKey="Reset"
                settingValue={i18n.settings.generalSettings.reset.text}
                on:clicked={resetOptions}
            />
        </Item>
    </Panel>

    <!-- KeeWeb 设置面板 -->
    <Panel display={panels[1].key === focusPanel}>
        <Tabs
            focus={keeweb_settings_tabs_focus_key}
            tabs={tabs.keeweb}
            let:focus={focusTab}
        >
            <!-- 标签页 1 - 插件设置 -->
            <div
                data-type={tabs.keeweb[0].name}
                class:fn__none={tabs.keeweb[0].key !== focusTab}
            >
                <!-- 思源插件 -->
                <Item
                    title={i18n.settings.keewebSettings.pluginTab.siyuan.title}
                    text={i18n.settings.keewebSettings.pluginTab.siyuan.description}
                >
                    <Input
                        slot="input"
                        type={ItemType.checkbox}
                        settingKey="siyuan"
                        settingValue={config.keeweb.plugin.siyuan.enable}
                        on:changed={async e => {
                            config.keeweb.plugin.siyuan.enable = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>
            </div>

            <!-- 标签页 2 - 窗口设置 -->
            <div
                data-type={tabs.keeweb[1].name}
                class:fn__none={tabs.keeweb[1].key !== focusTab}
            >
                <!-- 窗口宽度 -->
                <Item
                    title={i18n.settings.keewebSettings.windowTab.width.title}
                    text={i18n.settings.keewebSettings.windowTab.width.description}
                >
                    <Input
                        slot="input"
                        type={ItemType.number}
                        settingKey="width"
                        settingValue={config.window.width}
                        limits={{ min: 320, max: 15360, step: 40 }}
                        on:changed={async e => {
                            config.window.width = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 窗口高度 -->
                <Item
                    title={i18n.settings.keewebSettings.windowTab.height.title}
                    text={i18n.settings.keewebSettings.windowTab.height.description}
                >
                    <Input
                        slot="input"
                        type={ItemType.number}
                        settingKey="height"
                        settingValue={config.window.height}
                        limits={{ min: 240, max: 8640, step: 40 }}
                        on:changed={async e => {
                            config.window.height = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 窗口居中 -->
                <Item
                    title={i18n.settings.keewebSettings.windowTab.center.title}
                    text={i18n.settings.keewebSettings.windowTab.center.description}
                >
                    <Input
                        slot="input"
                        type={ItemType.checkbox}
                        settingKey="center"
                        settingValue={config.window.center}
                        on:changed={async e => {
                            config.window.center = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 窗口置顶 -->
                <Item
                    title={i18n.settings.keewebSettings.windowTab.top.title}
                    text={i18n.settings.keewebSettings.windowTab.top.description}
                >
                    <Input
                        slot="input"
                        type={ItemType.checkbox}
                        settingKey="alwaysOnTop"
                        settingValue={config.window.alwaysOnTop}
                        on:changed={async e => {
                            config.window.alwaysOnTop = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>
            </div>
        </Tabs>
    </Panel>
</Panels>

<style lang="less">
</style>

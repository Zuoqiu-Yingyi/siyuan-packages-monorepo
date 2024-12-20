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
    import Input from "@workspace/components/siyuan/setting/item/Input.svelte";
    import { ItemType } from "@workspace/components/siyuan/setting/item/item";
    import Item from "@workspace/components/siyuan/setting/item/Item.svelte";
    import Panel from "@workspace/components/siyuan/setting/panel/Panel.svelte";
    import Panels from "@workspace/components/siyuan/setting/panel/Panels.svelte";
    import { type ITab } from "@workspace/components/siyuan/setting/tab";

    import type TypewriterPlugin from "@/index";
    import type { IConfig } from "@/types/config";

    interface IProps {
        config: IConfig; // 传入的配置项
        plugin: InstanceType<typeof TypewriterPlugin>; // 插件实例
    }

    const {
        config,
        plugin,
    }: IProps = $props();

    const i18n = plugin.i18n;

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

    const PanelKey = {
        general: "general", // 常规设置
        focus: "focus", // 焦点设置
        typewriter: "typewriter", // 打字机设置
    } as const;

    const panels_focus_key = PanelKey.general;
    const panels: ITab[] = [
        {
            key: PanelKey.general,
            text: i18n.settings.generalSettings.title,
            name: i18n.settings.generalSettings.title,
            icon: "#iconSettings",
        },
        {
            key: PanelKey.focus,
            text: i18n.settings.focusSettings.title,
            name: i18n.settings.focusSettings.title,
            icon: "#iconFocus",
        },
        {
            key: PanelKey.typewriter,
            text: i18n.settings.typewriterSettings.title,
            name: i18n.settings.typewriterSettings.title,
            icon: "#iconKeymap",
        },
    ];
</script>

<Panels
    focus={panels_focus_key}
    {panels}
    let:focus={focusPanel}
>
    <!-- 常规设置面板 -->
    <Panel display={panels[0]?.key === focusPanel}>
        <!-- 重置设置 -->
        <Item
            text={i18n.settings.generalSettings.reset.description}
            title={i18n.settings.generalSettings.reset.title}
        >
            <Input
                slot="input"
                settingKey="Reset"
                settingValue={i18n.settings.generalSettings.reset.text}
                type={ItemType.button}
                on:clicked={resetOptions}
            />
        </Item>
    </Panel>

    <!-- 焦点设置面板 -->
    <Panel display={panels[1]?.key === focusPanel}>
        <!-- 启用焦点模式 -->
        <Item
            text={i18n.settings.focusSettings.enable.description}
            title={i18n.settings.focusSettings.enable.title}
        >
            <Input
                slot="input"
                settingKey="enable"
                settingValue={config.focus.enable}
                type={ItemType.checkbox}
                on:changed={async (e) => {
                    config.focus.enable = e.detail.value;
                    await updated();
                }}
            />
        </Item>
    </Panel>

    <!-- 打字机设置面板 -->
    <Panel display={panels[2]?.key === focusPanel}>
        <!-- 启用打字机模式 -->
        <Item
            text={i18n.settings.typewriterSettings.enable.description}
            title={i18n.settings.typewriterSettings.enable.title}
        >
            <Input
                slot="input"
                settingKey="enable"
                settingValue={config.typewriter.enable}
                type={ItemType.checkbox}
                on:changed={async (e) => {
                    config.typewriter.enable = e.detail.value;
                    await updated();
                }}
            />
        </Item>

        <!-- 代码块焦点跟随行 -->
        <Item
            text={i18n.settings.typewriterSettings.code.description}
            title={i18n.settings.typewriterSettings.code.title}
        >
            <Input
                slot="input"
                settingKey="code"
                settingValue={config.typewriter.code.row}
                type={ItemType.checkbox}
                on:changed={async (e) => {
                    config.typewriter.code.row = e.detail.value;
                    await updated();
                }}
            />
        </Item>

        <!-- 表格块焦点跟随单元格 -->
        <Item
            text={i18n.settings.typewriterSettings.table.description}
            title={i18n.settings.typewriterSettings.table.title}
        >
            <Input
                slot="input"
                settingKey="table"
                settingValue={config.typewriter.table.row}
                type={ItemType.checkbox}
                on:changed={async (e) => {
                    config.typewriter.table.row = e.detail.value;
                    await updated();
                }}
            />
        </Item>

        <!-- 属性表焦点跟随单元格 -->
        <Item
            text={i18n.settings.typewriterSettings.view.description}
            title={i18n.settings.typewriterSettings.view.title}
        >
            <Input
                slot="input"
                settingKey="view"
                settingValue={config.typewriter.view.row}
                type={ItemType.checkbox}
                on:changed={async (e) => {
                    config.typewriter.view.row = e.detail.value;
                    await updated();
                }}
            />
        </Item>

        <!-- 滚动延时时间 -->
        <Item
            text={i18n.settings.typewriterSettings.timeout.description}
            title={i18n.settings.typewriterSettings.timeout.title}
        >
            <Input
                slot="input"
                limits={{
                    min: 0,
                    max: Infinity,
                    step: 25,
                }}
                settingKey="timeout"
                settingValue={config.typewriter.timeout}
                type={ItemType.number}
                on:changed={async (e) => {
                    config.typewriter.timeout = e.detail.value;
                    await updated();
                }}
            />
        </Item>
    </Panel>
</Panels>

<style lang="less">
</style>

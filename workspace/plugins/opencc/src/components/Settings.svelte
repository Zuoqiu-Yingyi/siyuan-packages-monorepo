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
    import Tabs from "@workspace/components/siyuan/setting/tab/Tabs.svelte";

    import { Locale } from "@/opencc";

    import { locale2lang } from "../opencc/lang";

    import type OpenCCPlugin from "@/index";
    import type { IConfig } from "@/types/config";

    interface IProps {
        config: IConfig; // 传入的配置项
        plugin: InstanceType<typeof OpenCCPlugin>; // 插件实例
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

    /* eslint-disable no-unused-vars */
    enum PanelKey {
        general, // 常规设置
        convert, // 转换设置
    }

    enum TabKey {
        global, // 全局设置
        s2t, // 简体 -> 繁体
        t2s, // 繁体 -> 简体
        custom, // 自定义
    }
    /* eslint-enable no-unused-vars */

    const panels_focus_key = PanelKey.general;
    const panels: ITab[] = [
        {
            key: PanelKey.general,
            text: i18n.settings.generalSettings.title,
            name: i18n.settings.generalSettings.title,
            icon: "#iconSettings",
        },
        {
            key: PanelKey.convert,
            text: i18n.settings.convertSettings.title,
            name: i18n.settings.convertSettings.title,
            icon: "#icon-opencc-convert",
        },
    ];

    const convert_settings_tabs_focus_key = TabKey.global;
    const tabs = {
        convert: [
            {
                key: TabKey.global,
                text: i18n.settings.convertSettings.globalTab.title,
                name: i18n.settings.convertSettings.globalTab.title,
                icon: "⚙",
            },
            {
                key: TabKey.s2t,
                text: i18n.settings.convertSettings.s2tTab.title,
                name: i18n.settings.convertSettings.s2tTab.title,
            },
            {
                key: TabKey.t2s,
                text: i18n.settings.convertSettings.t2sTab.title,
                name: i18n.settings.convertSettings.t2sTab.title,
            },
            {
                key: TabKey.custom,
                text: i18n.settings.convertSettings.customTab.title,
                name: i18n.settings.convertSettings.customTab.title,
            },
        ] as ITab[],
    };

    /* 所有类型标签 */
    const full_options = [
        { key: Locale.cn, text: `${i18n.locale[Locale.cn]} [${locale2lang(Locale.cn)}]` },
        { key: Locale.t, text: `${i18n.locale[Locale.t]} [${locale2lang(Locale.t)}]` },
        { key: Locale.hk, text: `${i18n.locale[Locale.hk]} [${locale2lang(Locale.hk)}]` },
        { key: Locale.tw, text: `${i18n.locale[Locale.tw]} [${locale2lang(Locale.tw)}]` },
        { key: Locale.twp, text: `${i18n.locale[Locale.twp]} [${locale2lang(Locale.twp)}]` },
        { key: Locale.jp, text: `${i18n.locale[Locale.jp]} [${locale2lang(Locale.jp)}]` },
    ];

    /* 简体类型标签 */
    const simplified_options = [
        full_options[0]!, // cn
        full_options[5]!, // jp
    ];

    /* 繁体类型标签 */
    const traditional_options = [
        full_options[1]!, // t
        full_options[2]!, // hk
        full_options[3]!, // tw
        full_options[4]!, // twp
        full_options[5]!, // jp
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

    <!-- 转换设置面板 -->
    <Panel display={panels[1]?.key === focusPanel}>
        <Tabs
            focus={convert_settings_tabs_focus_key}
            tabs={tabs.convert}
            let:focus={focusTab}
        >
            <!-- 标签页 1 - 全局设置 -->
            <div
                class:fn__none={tabs.convert[0]?.key !== focusTab}
                data-type={tabs.convert[0]?.name}
            >
                <!-- 全局扩展词典 -->
                <Item
                    block={true}
                    text={i18n.settings.options.dictionary.description}
                    title={i18n.settings.convertSettings.globalTab.dictionary.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={i18n.settings.options.dictionary.placeholder}
                        settingKey="dictionary"
                        settingValue={config.opencc.dict}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.opencc.dict = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>
            </div>

            <!-- 标签页 2 - 简→繁 -->
            <div
                class:fn__none={tabs.convert[1]?.key !== focusTab}
                data-type={tabs.convert[1]?.name}
            >
                <!-- 原始文本类型 -->
                <Item
                    text={i18n.settings.options.sourceTextType.description}
                    title={i18n.settings.options.sourceTextType.title}
                >
                    <Input
                        slot="input"
                        options={simplified_options}
                        settingKey="s2t.from"
                        settingValue={config.opencc.s2t.from}
                        type={ItemType.select}
                        on:changed={async (e) => {
                            config.opencc.s2t.from = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 目标文本类型 -->
                <Item
                    text={i18n.settings.options.targetTextType.description}
                    title={i18n.settings.options.targetTextType.title}
                >
                    <Input
                        slot="input"
                        options={traditional_options}
                        settingKey="s2t.to"
                        settingValue={config.opencc.s2t.to}
                        type={ItemType.select}
                        on:changed={async (e) => {
                            config.opencc.s2t.to = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 扩展词典 -->
                <Item
                    block={true}
                    text={i18n.settings.options.dictionary.description}
                    title={i18n.settings.options.dictionary.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={i18n.settings.options.dictionary.placeholder}
                        settingKey="s2t.dictionary"
                        settingValue={config.opencc.s2t.dict}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.opencc.s2t.dict = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>
            </div>

            <!-- 标签页 3 - 繁→简 -->
            <div
                class:fn__none={tabs.convert[2]?.key !== focusTab}
                data-type={tabs.convert[2]?.name}
            >
                <!-- 原始文本类型 -->
                <Item
                    text={i18n.settings.options.sourceTextType.description}
                    title={i18n.settings.options.sourceTextType.title}
                >
                    <Input
                        slot="input"
                        options={traditional_options}
                        settingKey="t2s.from"
                        settingValue={config.opencc.t2s.from}
                        type={ItemType.select}
                        on:changed={async (e) => {
                            config.opencc.t2s.from = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 目标文本类型 -->
                <Item
                    text={i18n.settings.options.targetTextType.description}
                    title={i18n.settings.options.targetTextType.title}
                >
                    <Input
                        slot="input"
                        options={simplified_options}
                        settingKey="t2s.to"
                        settingValue={config.opencc.t2s.to}
                        type={ItemType.select}
                        on:changed={async (e) => {
                            config.opencc.t2s.to = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 扩展词典 -->
                <Item
                    block={true}
                    text={i18n.settings.options.dictionary.description}
                    title={i18n.settings.options.dictionary.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={i18n.settings.options.dictionary.placeholder}
                        settingKey="t2s.dictionary"
                        settingValue={config.opencc.t2s.dict}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.opencc.t2s.dict = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>
            </div>

            <!-- 标签页 4 - 自定义转换 -->
            <div
                class:fn__none={tabs.convert[3]?.key !== focusTab}
                data-type={tabs.convert[3]?.name}
            >
                <!-- 原始文本类型 -->
                <Item
                    text={i18n.settings.options.sourceTextType.description}
                    title={i18n.settings.options.sourceTextType.title}
                >
                    <Input
                        slot="input"
                        options={full_options}
                        settingKey="custom.from"
                        settingValue={config.opencc.custom.from}
                        type={ItemType.select}
                        on:changed={async (e) => {
                            config.opencc.custom.from = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 目标文本类型 -->
                <Item
                    text={i18n.settings.options.targetTextType.description}
                    title={i18n.settings.options.targetTextType.title}
                >
                    <Input
                        slot="input"
                        options={full_options}
                        settingKey="custom.to"
                        settingValue={config.opencc.custom.to}
                        type={ItemType.select}
                        on:changed={async (e) => {
                            config.opencc.custom.to = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 扩展词典 -->
                <Item
                    block={true}
                    text={i18n.settings.options.dictionary.description}
                    title={i18n.settings.options.dictionary.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={i18n.settings.options.dictionary.placeholder}
                        settingKey="custom.dictionary"
                        settingValue={config.opencc.custom.dict}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.opencc.custom.dict = e.detail.value;
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

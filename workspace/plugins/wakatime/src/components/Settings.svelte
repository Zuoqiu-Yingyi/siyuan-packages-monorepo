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
    import { fn__code } from "@workspace/utils/siyuan/text/span";

    import CONSTANTS from "@/constants";
    import { Category } from "@/wakatime/heartbeats";

    import type WakaTimePlugin from "@/index";
    import type { IConfig } from "@/types/config";
    import type { I18N } from "@/utils/i18n";

    export let config: IConfig; // 传入的配置项
    export let plugin: InstanceType<typeof WakaTimePlugin>; // 插件实例

    let useragent_placeholder = plugin.wakatimeDefaultUserAgent;

    const i18n = plugin.i18n as unknown as I18N;

    async function updated() {
        await plugin.updateConfig(config);
        useragent_placeholder = plugin.wakatimeDefaultUserAgent;
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

    function cleanCache() {
        plugin.siyuan.confirm(
            i18n.settings.generalSettings.cleanCache.title, // 标题
            i18n.settings.generalSettings.cleanCache.description, // 文本
            async () => {
                await plugin.clearCache(); // 重置配置
                globalThis.location.reload(); // 刷新页面
            }, // 确认按钮回调
        );
    }

    /* 测试服务 */
    async function testService(): Promise<boolean> {
        const status = await plugin.testService();
        if (status) {
            plugin.siyuan.showMessage(
                i18n.settings.wakatimeSettings.serviceTab.test.messages.success.replaceAll(
                    "{{1}}", //
                    fn__code(plugin.wakatimeApiBaseUrl), //
                ), //
                undefined, //
                "info", //
            );
        }
        else {
            plugin.siyuan.showMessage(
                i18n.settings.wakatimeSettings.serviceTab.test.messages.error.replaceAll(
                    "{{1}}", //
                    fn__code(plugin.wakatimeApiBaseUrl), //
                ), //
                undefined, //
                "error", //
            );
        }
        return status;
    }

    /* eslint-disable no-unused-vars */
    enum PanelKey {
        general, // 常规设置
        wakatime, // WakaTime 设置
    }

    enum TabKey {
        general, // 常规设置
        service, // 服务设置
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
            key: PanelKey.wakatime,
            text: i18n.settings.wakatimeSettings.title,
            name: i18n.settings.wakatimeSettings.title,
            icon: "#icon-wakatime",
        },
    ];

    const wakatime_settings_tabs_focus_key = TabKey.general;
    const tabs = {
        wakatime: [
            {
                key: TabKey.general,
                text: i18n.settings.wakatimeSettings.generalTab.title,
                name: i18n.settings.wakatimeSettings.generalTab.title,
                icon: "⚙",
            },
            {
                key: TabKey.service,
                text: i18n.settings.wakatimeSettings.serviceTab.title,
                name: i18n.settings.wakatimeSettings.serviceTab.title,
                icon: "🌐",
            },
        ] as ITab[],
    };

    /* 时间选择 */
    const time_limits = {
        min: 1,
        max: Infinity,
        step: 1,
    } as const;

    /* 操作类型标签 */
    const category_options = [
        { key: Category.Coding, text: Category.Coding },
        { key: Category.Building, text: Category.Building },
        { key: Category.Indexing, text: Category.Indexing },
        { key: Category.Debugging, text: Category.Debugging },
        { key: Category.Browsing, text: Category.Browsing },
        { key: Category.RunningTests, text: Category.RunningTests },
        { key: Category.WritingTests, text: Category.WritingTests },
        { key: Category.ManualTesting, text: Category.ManualTesting },
        { key: Category.WritingDocs, text: Category.WritingDocs },
        { key: Category.CodeReviewing, text: Category.CodeReviewing },
        { key: Category.Researching, text: Category.Researching },
        { key: Category.Learning, text: Category.Learning },
        { key: Category.Designing, text: Category.Designing },
    ];
</script>

<Panels
    focus={panels_focus_key}
    {panels}
    let:focus={focusPanel}
>
    <!-- 常规设置面板 -->
    <Panel display={panels[0]?.key === focusPanel}>
        <!-- 清理离线缓存 -->
        <Item
            text={i18n.settings.generalSettings.cleanCache.description}
            title={i18n.settings.generalSettings.cleanCache.title}
        >
            <Input
                slot="input"
                settingKey="cleanCache"
                settingValue={i18n.settings.generalSettings.cleanCache.text}
                type={ItemType.button}
                on:clicked={cleanCache}
            />
        </Item>

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

    <!-- 服务设置面板 -->
    <Panel display={panels[1]?.key === focusPanel}>
        <Tabs
            focus={wakatime_settings_tabs_focus_key}
            tabs={tabs.wakatime}
            let:focus={focusTab}
        >
            <!-- 标签页 1 - 常规设置 -->
            <div
                class:fn__none={tabs.wakatime[0]?.key !== focusTab}
                data-type={tabs.wakatime[0]?.name}
            >
                <!-- 心跳连接 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.heartbeats.description}
                    title={i18n.settings.wakatimeSettings.generalTab.heartbeats.title}
                >
                    <Input
                        slot="input"
                        settingKey="Heartbeats"
                        settingValue={config.wakatime.heartbeats}
                        type={ItemType.checkbox}
                        on:changed={async (e) => {
                            config.wakatime.heartbeats = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 工作空间名称 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.project.description}
                    title={i18n.settings.wakatimeSettings.generalTab.project.title}
                >
                    <Input
                        slot="input"
                        placeholder={plugin.wakatimeDefaultProject}
                        settingKey="project"
                        settingValue={config.wakatime.project}
                        type={ItemType.text}
                        on:changed={async (e) => {
                            config.wakatime.project = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 语言名称 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.language.description}
                    title={i18n.settings.wakatimeSettings.generalTab.language.title}
                >
                    <Input
                        slot="input"
                        placeholder={plugin.wakatimeDefaultLanguage}
                        settingKey="language"
                        settingValue={config.wakatime.language}
                        type={ItemType.text}
                        on:changed={async (e) => {
                            config.wakatime.language = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 推送时间间隔 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.interval.description}
                    title={i18n.settings.wakatimeSettings.generalTab.interval.title}
                >
                    <Input
                        slot="input"
                        limits={time_limits}
                        settingKey="interval"
                        settingValue={config.wakatime.interval}
                        type={ItemType.number}
                        on:changed={async (e) => {
                            config.wakatime.interval = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 查看操作标签 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.viewCategory.description}
                    title={i18n.settings.wakatimeSettings.generalTab.viewCategory.title}
                >
                    <Input
                        slot="input"
                        options={category_options}
                        settingKey="view.category"
                        settingValue={config.wakatime.view.category}
                        type={ItemType.select}
                        on:changed={async (e) => {
                            config.wakatime.view.category = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 编辑操作标签 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.editCategory.description}
                    title={i18n.settings.wakatimeSettings.generalTab.editCategory.title}
                >
                    <Input
                        slot="input"
                        options={category_options}
                        settingKey="edit.category"
                        settingValue={config.wakatime.edit.category}
                        type={ItemType.select}
                        on:changed={async (e) => {
                            config.wakatime.edit.category = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 系统名称 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.systemName.description}
                    title={i18n.settings.wakatimeSettings.generalTab.systemName.title}
                >
                    <Input
                        slot="input"
                        placeholder={plugin.wakatimeDefaultSystemName}
                        settingKey="system_name"
                        settingValue={config.wakatime.system_name}
                        type={ItemType.text}
                        on:changed={async (e) => {
                            config.wakatime.system_name = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 系统版本 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.systemVersion.description}
                    title={i18n.settings.wakatimeSettings.generalTab.systemVersion.title}
                >
                    <Input
                        slot="input"
                        placeholder={plugin.wakatimeDefaultSystemVersion}
                        settingKey="system_version"
                        settingValue={config.wakatime.system_version}
                        type={ItemType.text}
                        on:changed={async (e) => {
                            config.wakatime.system_version = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 系统内核 -->
                <Item
                    text={i18n.settings.wakatimeSettings.generalTab.systemArch.description}
                    title={i18n.settings.wakatimeSettings.generalTab.systemArch.title}
                >
                    <Input
                        slot="input"
                        placeholder={plugin.wakatimeDefaultSystemArch}
                        settingKey="system_arch"
                        settingValue={config.wakatime.system_arch}
                        type={ItemType.text}
                        on:changed={async (e) => {
                            config.wakatime.system_arch = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- UserAgent -->
                <Item
                    block={true}
                    text={i18n.settings.wakatimeSettings.generalTab.userAgent.description}
                    title={i18n.settings.wakatimeSettings.generalTab.userAgent.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={useragent_placeholder}
                        settingKey="useragent"
                        settingValue={config.wakatime.useragent}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.wakatime.useragent = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>
            </div>

            <!-- 标签页 2 - 服务设置 -->
            <div
                class:fn__none={tabs.wakatime[1]?.key !== focusTab}
                data-type={tabs.wakatime[1]?.name}
            >
                <!-- 测试连接状态 -->
                <Item
                    text={i18n.settings.wakatimeSettings.serviceTab.test.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.test.title}
                >
                    <Input
                        slot="input"
                        settingKey="Test"
                        settingValue={i18n.settings.wakatimeSettings.serviceTab.test.text}
                        type={ItemType.button}
                        on:clicked={testService}
                    />
                </Item>

                <!-- API URL -->
                <Item
                    block={true}
                    text={i18n.settings.wakatimeSettings.serviceTab.apiURL.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.apiURL.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={plugin.wakatimeDefaultApiUrl}
                        settingKey="api_url"
                        settingValue={config.wakatime.api_url}
                        type={ItemType.text}
                        on:changed={async (e) => {
                            config.wakatime.api_url = e.detail.value;
                            await updated();
                            await testService();
                        }}
                    />
                </Item>

                <!-- API KEY -->
                <Item
                    block={true}
                    text={i18n.settings.wakatimeSettings.serviceTab.apiKey.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.apiKey.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder="API KEY"
                        settingKey="api_key"
                        settingValue={config.wakatime.api_key}
                        type={ItemType.text}
                        on:changed={async (e) => {
                            config.wakatime.api_key = e.detail.value;
                            await updated();
                            await testService();
                        }}
                    />
                </Item>

                <!-- 主机名称 -->
                <Item
                    text={i18n.settings.wakatimeSettings.serviceTab.hostname.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.hostname.title}
                >
                    <Input
                        slot="input"
                        placeholder={plugin.wakatimeDefaultHostname}
                        settingKey="hostname"
                        settingValue={config.wakatime.hostname}
                        type={ItemType.text}
                        on:changed={async (e) => {
                            config.wakatime.hostname = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 超时时间 -->
                <Item
                    text={i18n.settings.wakatimeSettings.serviceTab.timeout.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.timeout.title}
                >
                    <Input
                        slot="input"
                        limits={time_limits}
                        settingKey="timeout"
                        settingValue={config.wakatime.timeout}
                        type={ItemType.number}
                        on:changed={async (e) => {
                            config.wakatime.timeout = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 隐藏笔记本名 -->
                <Item
                    text={i18n.settings.wakatimeSettings.serviceTab.hide_branch_names.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.hide_branch_names.title}
                >
                    <Input
                        slot="input"
                        settingKey="hide_branch_names"
                        settingValue={config.wakatime.hide_branch_names}
                        type={ItemType.checkbox}
                        on:changed={async (e) => {
                            config.wakatime.hide_branch_names = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 隐藏文件名 -->
                <Item
                    text={i18n.settings.wakatimeSettings.serviceTab.hide_file_names.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.hide_file_names.title}
                >
                    <Input
                        slot="input"
                        settingKey="hide_file_names"
                        settingValue={config.wakatime.hide_file_names}
                        type={ItemType.checkbox}
                        on:changed={async (e) => {
                            config.wakatime.hide_file_names = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- 离线缓存 -->
                <Item
                    text={i18n.settings.wakatimeSettings.serviceTab.offline.description.replaceAll(
                        "{{1}}", //
                        fn__code(CONSTANTS.OFFLINE_CACHE_PATH), //
                    )}
                    title={i18n.settings.wakatimeSettings.serviceTab.offline.title}
                >
                    <Input
                        slot="input"
                        settingKey="offline"
                        settingValue={config.wakatime.offline}
                        type={ItemType.checkbox}
                        on:changed={async (e) => {
                            config.wakatime.offline = e.detail.value;
                            await updated();
                        }}
                    />
                </Item>

                <!-- ID 包含列表 -->
                <Item
                    block={true}
                    text={i18n.settings.wakatimeSettings.serviceTab.includeID.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.includeID.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={i18n.settings.wakatimeSettings.serviceTab.includeID.placeholder}
                        settingKey="includeID"
                        settingValue={config.wakatime.includeID.join("\n")}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.wakatime.includeID = e.detail.value.split("\n");
                            await updated();
                        }}
                    />
                </Item>

                <!-- ID 排除列表 -->
                <Item
                    block={true}
                    text={i18n.settings.wakatimeSettings.serviceTab.excludeID.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.excludeID.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={i18n.settings.wakatimeSettings.serviceTab.excludeID.placeholder}
                        settingKey="excludeID"
                        settingValue={config.wakatime.excludeID.join("\n")}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.wakatime.excludeID = e.detail.value.split("\n");
                            await updated();
                        }}
                    />
                </Item>

                <!-- 包含列表 -->
                <Item
                    block={true}
                    text={i18n.settings.wakatimeSettings.serviceTab.include.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.include.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={i18n.settings.wakatimeSettings.serviceTab.include.placeholder}
                        settingKey="include"
                        settingValue={config.wakatime.include.join("\n")}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.wakatime.include = e.detail.value.split("\n");
                            await updated();
                        }}
                    />
                </Item>

                <!-- 排除列表 -->
                <Item
                    block={true}
                    text={i18n.settings.wakatimeSettings.serviceTab.exclude.description}
                    title={i18n.settings.wakatimeSettings.serviceTab.exclude.title}
                >
                    <Input
                        slot="input"
                        block={true}
                        placeholder={i18n.settings.wakatimeSettings.serviceTab.exclude.placeholder}
                        settingKey="exclude"
                        settingValue={config.wakatime.exclude.join("\n")}
                        type={ItemType.textarea}
                        on:changed={async (e) => {
                            config.wakatime.exclude = e.detail.value.split("\n");
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

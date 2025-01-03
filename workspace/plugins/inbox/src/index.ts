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
    Client,
} from "@siyuan-community/siyuan-sdk";
import siyuan from "siyuan";
import { mount, unmount } from "svelte";

import {
    FLAG_MOBILE,
} from "@workspace/utils/env/front-end";
import { Logger } from "@workspace/utils/logger";
import { mergeIgnoreArray } from "@workspace/utils/misc/merge";

import InboxDock from "./components/InboxDock.svelte";
import Settings from "./components/Settings.svelte";

import icon_inbox from "./assets/symbols/icon-inbox.symbol?raw";
import { DEFAULT_CONFIG } from "./configs/default";

import type { IConfig } from "./types/config";
import type { I18N } from "./utils/i18n";

export default class InboxPlugin extends siyuan.Plugin {
    static readonly GLOBAL_CONFIG_NAME = "config.json";

    // @ts-expect-error ignore original type
    declare public readonly i18n: I18N;

    public readonly siyuan = siyuan;
    public readonly logger: InstanceType<typeof Logger>;
    public readonly client: InstanceType<typeof Client>;

    protected readonly SETTINGS_DIALOG_ID: string;
    protected readonly INBOX_APP_PATH: string;

    protected config: IConfig = mergeIgnoreArray(DEFAULT_CONFIG);

    protected inboxDock!: {
        dock: ReturnType<siyuan.Plugin["addDock"]>;
        model?: siyuan.Dock;
        component?: ReturnType<typeof mount>;
    }; // 收集箱面板

    constructor(options: any) {
        super(options);

        this.logger = new Logger(this.name);
        this.client = new Client(undefined, "fetch");

        this.SETTINGS_DIALOG_ID = `${this.name}-settings-dialog`;
        this.INBOX_APP_PATH = `plugins/${this.name}/`;
    }

    public override onload(): void {
        // this.logger.debug(this);

        /* 注册图标 */
        this.addIcons([
            icon_inbox,
        ].join(""));

        /* 注册侧边栏 */
        const plugin = this as InstanceType<typeof InboxPlugin>;
        this.inboxDock = {
            dock: this.addDock({
                config: {
                    position: "RightTop",
                    size: { width: 256, height: 0 },
                    icon: "icon-inbox",
                    title: this.displayName,
                    show: true,
                },
                data: {
                    src: plugin.INBOX_APP_PATH,
                },
                type: "-dock",
                init() {
                    // plugin.logger.debug(this);

                    this.element.classList.add("fn__flex-column");
                    const dock = mount(InboxDock, {
                        target: this.element,
                        props: {
                            plugin,
                            src: plugin.INBOX_APP_PATH,
                            ...this.data,
                        },
                    });
                    plugin.inboxDock.model = this;
                    plugin.inboxDock.component = dock;
                },
                destroy() {
                    if (plugin.inboxDock.component) {
                        unmount(plugin.inboxDock.component);
                    }
                    delete plugin.inboxDock.component;
                    delete plugin.inboxDock.model;
                },
            }),
        };

        this.loadData(InboxPlugin.GLOBAL_CONFIG_NAME)
            .then((config) => {
                this.config = mergeIgnoreArray(DEFAULT_CONFIG, config || {}) as IConfig;
            })
            .catch((error) => this.logger.error(error))
            .finally(() => {
            });
    }

    public override onLayoutReady(): void {
    }

    public override onunload(): void {
    }

    public override openSetting(): void {
        const dialog = new siyuan.Dialog({
            title: `${this.displayName} <code class="fn__code">${this.name}</code>`,
            content: `<div id="${this.SETTINGS_DIALOG_ID}" class="fn__flex-column" />`,
            width: FLAG_MOBILE ? "92vw" : "720px",
            height: FLAG_MOBILE ? undefined : "640px",
        });
        const target = dialog.element.querySelector(`#${this.SETTINGS_DIALOG_ID}`);
        if (target) {
            mount(Settings, {
                target,
                props: {
                    config: this.config,
                    plugin: this,
                },
            });
        }
    }

    /* 重置插件配置 */
    public async resetConfig(): Promise<void> {
        return this.updateConfig(mergeIgnoreArray(DEFAULT_CONFIG) as IConfig);
    }

    /* 更新插件配置 */
    public async updateConfig(config?: IConfig): Promise<void> {
        if (config && config !== this.config) {
            this.config = config;
        }
        return this.saveData(InboxPlugin.GLOBAL_CONFIG_NAME, JSON.stringify(this.config, undefined, 4));
    }
};

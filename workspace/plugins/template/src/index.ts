// Copyright (C) 2024 Zuoqiu Yingyi
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

import * as sdk from "@siyuan-community/siyuan-sdk";
import siyuan from "siyuan";
import { mount } from "svelte";

import {
    FLAG_MOBILE,
} from "@workspace/utils/env/front-end";
import { Logger } from "@workspace/utils/logger";
import { mergeIgnoreArray } from "@workspace/utils/misc/merge";

import Settings from "./components/Settings.svelte";

import { DEFAULT_CONFIG } from "./configs/default";

import type { ISiyuanGlobal } from "@workspace/types/siyuan";

import type { IConfig } from "./types/config";
import type { I18N } from "./utils/i18n";

declare const _globalThis: ISiyuanGlobal;

export default class TemplatePlugin extends siyuan.Plugin {
    public static readonly GLOBAL_CONFIG_NAME = "config.json";

    // @ts-expect-error ignore original type
    declare public readonly i18n: I18N;

    public readonly siyuan = siyuan;
    public readonly logger: InstanceType<typeof Logger>;
    public readonly client: InstanceType<typeof sdk.Client>;

    protected readonly SETTINGS_DIALOG_ID: string;

    protected config: IConfig = mergeIgnoreArray(DEFAULT_CONFIG);

    constructor(options: any) {
        super(options);

        this.logger = new Logger(this.name);
        this.client = new sdk.Client(undefined, "fetch");

        this.SETTINGS_DIALOG_ID = `${this.name}-settings-dialog`;
    }

    public override onload(): void {
        // this.logger.debug(this);

        /* 注册图标 */
        this.addIcons([
        ].join(""));

        this.loadData(TemplatePlugin.GLOBAL_CONFIG_NAME)
            .then((config) => {
                if (config) {
                    this.config = mergeIgnoreArray(DEFAULT_CONFIG, config) as IConfig;
                }
                else {
                    this.config = mergeIgnoreArray(DEFAULT_CONFIG);
                    this.updateConfig();
                }
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
        return this.saveData(TemplatePlugin.GLOBAL_CONFIG_NAME, JSON.stringify(this.config, undefined, 4));
    }
};

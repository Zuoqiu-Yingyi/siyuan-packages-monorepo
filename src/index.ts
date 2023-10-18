/**
 * Copyright (C) 2023 Zuoqiu Yingyi
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import siyuan from "siyuan";
import type { ISiyuanGlobal } from "@workspace/types/siyuan";

import {
    Client,
    type types,
} from "@siyuan-community/siyuan-sdk";

import Settings from "./components/Settings.svelte";

import {
    FLAG_MOBILE,
} from "@workspace/utils/env/front-end";
import { Logger } from "@workspace/utils/logger";
import { mergeIgnoreArray } from "@workspace/utils/misc/merge";
import { DEFAULT_CONFIG } from "./configs/default";
import type { I18N } from "./utils/i18n";
import type { IConfig } from "./types/config";

declare var globalThis: ISiyuanGlobal;

export type TLocal = Record<string, any>;

export default class KeepassPlugin extends siyuan.Plugin {
    public static readonly GLOBAL_CONFIG_NAME = "global-config";
    public static readonly LOCAL_STORAGE_NAME = "local.json";

    public static readonly LOCAL_STORAGE_KEY_PREFIX = "plugin-keepass-";

    declare public readonly i18n: I18N;

    public readonly siyuan = siyuan;
    public readonly logger: InstanceType<typeof Logger>;
    public readonly client: InstanceType<typeof Client>;

    protected readonly SETTINGS_DIALOG_ID: string;

    protected config: IConfig = mergeIgnoreArray(DEFAULT_CONFIG);
    protected local: TLocal = {};

    constructor(options: any) {
        super(options);

        this.logger = new Logger(this.name);
        this.client = new Client(undefined, "fetch");

        this.SETTINGS_DIALOG_ID = `${this.name}-settings-dialog`;
    }

    onload(): void {
        // this.logger.debug(this);

        /* 注册图标 */
        this.addIcons([
        ].join(""));

        this.loadData(KeepassPlugin.GLOBAL_CONFIG_NAME)
            .then(config => {
                if (config) {
                    this.config = mergeIgnoreArray(DEFAULT_CONFIG, config) as IConfig;
                }
                else {
                    this.config = mergeIgnoreArray(DEFAULT_CONFIG);
                    this.updateConfig();
                }
            })
            .catch(error => this.logger.error(error))
            .finally(() => {
            });

        this.loadLocalStorage();
        globalThis.addEventListener("storage", this.storageEventListener);
    }

    onLayoutReady(): void {
    }

    onunload(): void {
        globalThis.removeEventListener("storage", this.storageEventListener);
        this.saveLocalStorage();
    }

    openSetting(): void {
        const that = this;
        const dialog = new siyuan.Dialog({
            title: `${this.displayName} <code class="fn__code">${this.name}</code>`,
            content: `<div id="${that.SETTINGS_DIALOG_ID}" class="fn__flex-column" />`,
            width: FLAG_MOBILE ? "92vw" : "720px",
            height: FLAG_MOBILE ? undefined : "640px",
        });
        const target = dialog.element.querySelector(`#${that.SETTINGS_DIALOG_ID}`);
        if (target) {
            const settings = new Settings({
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
        return this.saveData(KeepassPlugin.GLOBAL_CONFIG_NAME, this.config);
    }

    /**
     * 加载 localStorage
     * @returns
     * - `this.local`: 加载成功
     * - `undefined`: 加载失败
     */
    public async loadLocalStorage(): Promise<TLocal | void> {
        const local = await this.loadLocal();
        if (local) {
            this.setLocalStoragItems(local);
        }
        return local;
    }

    /**
     * 保存 localStorage
     * @returns
     * - `true`: 保存成功
     * - `false`: 保存失败
     */
    public async saveLocalStorage(): Promise<boolean> {
        const local = this.getLocalStorageItems();
        return this.saveLocal(local);
    }

    /**
     * 加载 local
     * @retruns
     * - `this.local`: 加载成功
     * - `undefined`: 加载失败
     */
    public async loadLocal(): Promise<TLocal | void> {
        try {
            const local = await this.loadData(KeepassPlugin.LOCAL_STORAGE_NAME);
            if (local) {
                this.local = local;
                return this.local;
            }
        }
        catch (error) {
            this.logger.error(error);
        }
    }

    /**
     * 保存 local
     * @returns
     * - `true`: 保存成功
     * - `false`: 保存失败
     */
    public async saveLocal(local: TLocal = this.local): Promise<boolean> {
        try {
            await this.saveData(
                KeepassPlugin.LOCAL_STORAGE_NAME,
                JSON.stringify(local, undefined, 4),
            );
            return true;
        }
        catch (error) {
            this.logger.error(error);
            return false;
        }
    }

    /**
     * 设置 localStorage 项
     */
    public setLocalStoragItems(local: TLocal = this.local): void {
        for (const [key, value] of Object.entries(local)) {
            globalThis.localStorage.setItem(key, JSON.stringify(value));
        }
    }

    /**
     * 获取 localStorage 项
     * @param prefix 键名前缀
     */
    public getLocalStorageItems(): TLocal {
        this.local = {};
        for (const [key, value] of Object.entries(globalThis.localStorage)) {
            if (this.isLocalStorageKey(key)) {
                this.local[key] = JSON.parse(value);
            }
        }
        return this.local;
    }

    /**
     * 判断一个 localStorage 键是否为本插件的配置项
     * @param key 键名
     * @param prefix 键名前缀
     * @returns 是否为本插件的配置项
     */
    public isLocalStorageKey(
        key: string,
        prefix: string = KeepassPlugin.LOCAL_STORAGE_KEY_PREFIX,
    ): boolean {
        return key.startsWith(prefix);
    }

    /**
     * 储存变更事件监听器
     * REF: https://developer.mozilla.org/zh-CN/docs/Web/API/StorageEvent
     */
    public readonly storageEventListener = async (e: StorageEvent) => {
        // this.logger.debug(e);
        if (e.storageArea === globalThis.localStorage) {
            let save = false; // 是否需要保存
            if (e.key === null) { // 使用了 clear() 方法
                this.local = {};
                save = true;
            }
            else if (this.isLocalStorageKey(e.key)) {
                if (e.newValue === null) { // 使用了 removeItem() 方法
                    delete this.local[e.key];
                    save = true;
                }
                else {
                    this.local[e.key] = JSON.parse(e.newValue);
                    save = true;
                }
            }

            if (save) {
                await this.saveLocal();
            }
        }
    }
};

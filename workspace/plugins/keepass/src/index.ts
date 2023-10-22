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
import manifest from "~/public/plugin.json";
import {
    openDB,
    type IDBPDatabase,
    type OpenDBCallbacks,
} from "idb";
import type { ISiyuanGlobal } from "@workspace/types/siyuan";

import * as sdk from "@siyuan-community/siyuan-sdk";

import icon_keepass_keeweb from "./assets/symbols/icon-keepass-keeweb.symbol?raw";
import icon_keepass_slash from "./assets/symbols/icon-keepass-slash.symbol?raw";

import Settings from "./components/Settings.svelte";
import KeeWebTab from "@workspace/components/siyuan/tab/IframeTab.svelte";

import {
    FLAG_MOBILE,
} from "@workspace/utils/env/front-end";
import { Logger } from "@workspace/utils/logger";
import { mergeIgnoreArray } from "@workspace/utils/misc/merge";
import { join } from "@workspace/utils/path/browserify";
import { sync1 } from "@workspace/utils/misc/sync";
import { openWindow } from "@workspace/utils/window/open";
import { isWindowFocused } from "@workspace/utils/siyuan/focus";
import { DEFAULT_CONFIG } from "./configs/default";
import type { I18N } from "./utils/i18n";
import type { IConfig } from "./types/config";
import type {
    ILocalStoragePlugins,
    ILocalStoragePlugin,
    ILocalStoragePluginManifest,
} from "./types/keeweb";
import type {
    IDBSchema,
    IDBSchemaFiles,
    TDBDatabaseName,
    TDBStoreName,
} from "./types/idb-schema";
import { src2url } from "@workspace/utils/misc/url";

declare var globalThis: ISiyuanGlobal;

export type TLocal = Record<string, any>;
export interface IDB {
    FilesCache: IDBPDatabase<IDBSchemaFiles>;
    PluginFiles: IDBPDatabase<IDBSchemaFiles>;
}
export interface IKeeWebTab extends siyuan.ITabModel {
    component?: InstanceType<typeof KeeWebTab>;
}

export default class KeepassPlugin extends siyuan.Plugin {
    /**
     * 遍历所有的 indexedDB 数据库
     */
    protected static iterateIDB(schema: IDBSchema = KeepassPlugin.IDB_SCHEMA): { db: TDBDatabaseName, store: TDBStoreName }[] {
        const result: { db: TDBDatabaseName, store: TDBStoreName }[] = [];
        for (const [db_name, db] of Object.entries(schema)) {
            for (const store_name of Object.keys(db.stores)) {
                result.push({
                    db: db_name as TDBDatabaseName,
                    store: store_name as TDBStoreName,
                });
            }
        }
        return result;
    }

    public static readonly GLOBAL_CONFIG_NAME = "config.json";
    public static readonly LOCAL_STORAGE_NAME = "local.json";

    public static readonly LOCAL_STORAGE_KEY_PREFIX = "plugin-keepass-";
    public static readonly LOCAL_STORAGE_KEY_PLUGINS = `${KeepassPlugin.LOCAL_STORAGE_KEY_PREFIX}plugins`;
    public static readonly LOCAL_STORAGE_KEY_FILE_INFO = `${KeepassPlugin.LOCAL_STORAGE_KEY_PREFIX}file-info`;

    public static readonly CUSTOM_TAB_TYPE_KEEWEB = "-keeweb-tab";

    public static readonly IDB_SCHEMA: IDBSchema = {
        FilesCache: {
            name: "FilesCache",
            stores: {
                files: {
                    name: "files",
                } as const,
            } as const,
        } as const,
        PluginFiles: {
            name: "PluginFiles",
            stores: {
                files: {
                    name: "files"
                } as const,
            } as const,
        } as const,
    } as const;
    public static readonly IDB_ENTRIES = KeepassPlugin.iterateIDB();

    declare public readonly i18n: I18N;

    public readonly siyuan = siyuan;
    public readonly logger: InstanceType<typeof Logger>;
    public readonly client: InstanceType<typeof sdk.Client>;

    protected readonly SETTINGS_DIALOG_ID: string;
    protected readonly TOP_BAR_MENU_ID: string;

    protected readonly KEEWEB_BASE_PATHNAME: string;
    protected readonly KEEWEB_INDEX_PATHNAME: string;
    protected readonly KEEWEB_PLUGIN_PATHANEM: string;
    protected readonly KEEWEB_INDEX_URL: URL;

    protected readonly PLUGIN_INSTALL_PATH: string;
    protected readonly PLUGIN_STORAGE_PATH: string;
    protected readonly PLUGIN_STORAGE_IDB_PATH: string;

    protected readonly CUSTOM_TAB_ID_KEEWEB: string;

    protected readonly keewebTab: ReturnType<siyuan.Plugin["addTab"]>;

    protected manifest!: ILocalStoragePluginManifest;
    protected config: IConfig = mergeIgnoreArray(DEFAULT_CONFIG);
    protected local: TLocal = {};
    protected idb!: IDB;
    protected topBarButton?: HTMLElement; // 顶部菜单栏按钮

    constructor(options: any) {
        super(options);
        const baseURL = new URL(globalThis.document.baseURI);

        this.logger = new Logger(this.name);
        this.client = new sdk.Client(undefined, "fetch");

        this.SETTINGS_DIALOG_ID = `${this.name}-settings-dialog`;
        this.TOP_BAR_MENU_ID = `${this.name}-top-bar-menu`;

        this.KEEWEB_BASE_PATHNAME = join(baseURL.pathname, "plugins", this.name, "keeweb");
        this.KEEWEB_INDEX_PATHNAME = join(this.KEEWEB_BASE_PATHNAME, "app");
        this.KEEWEB_PLUGIN_PATHANEM = join(this.KEEWEB_BASE_PATHNAME, "plugins/siyuan");
        this.KEEWEB_INDEX_URL = src2url(`${this.KEEWEB_INDEX_PATHNAME}/?v=${manifest.version}`);

        this.PLUGIN_INSTALL_PATH = `/data/plugins/${this.name}`;
        this.PLUGIN_STORAGE_PATH = `/data/storage/petal/${this.name}`;
        this.PLUGIN_STORAGE_IDB_PATH = join(this.PLUGIN_STORAGE_PATH, "idb");

        this.CUSTOM_TAB_ID_KEEWEB = `${this.name}${KeepassPlugin.CUSTOM_TAB_TYPE_KEEWEB}`;

        this.keewebTab = this.addTab({
            type: KeepassPlugin.CUSTOM_TAB_TYPE_KEEWEB,
            init() {
                // plugin.logger.debug("tab-init");
                // plugin.logger.debug(this);

                const tab: IKeeWebTab = this;
                tab.component = new KeeWebTab({
                    target: tab.element,
                    props: {
                        ...tab.data,
                    },
                });
            },
            destroy() {
                // plugin.logger.debug("tab-destroy");

                const tab: IKeeWebTab = this;
                tab.component?.$destroy();
            },
        });
    }

    onload(): void {
        // this.logger.debug(this);

        /* 注册图标 */
        this.addIcons([
            icon_keepass_keeweb,
            icon_keepass_slash,
        ].join(""));

        /**
         * 注册快捷键命令
         * 在 onload 结束后即刻解析, 因此不能在回调函数中注册
         */
        this.addCommand({ // 在新页签中打开 KeeWeb
            langKey: "open-keeweb-tab",
            langText: this.i18n.menu.command.openKeeWebTab.text,
            hotkey: "⌥⌘K", // 默认快捷键 Ctrl + Alt + K
            customHotkey: "", // 自定义快捷键
            callback: this.openKeeWebTab,
        });
        this.addCommand({ // 在浏览器中打开 KeeWeb
            langKey: "open-keeweb-browser",
            langText: this.i18n.menu.command.openKeeWebBrowser.text,
            hotkey: "", // 默认快捷键
            customHotkey: "", // 自定义快捷键
            callback: this.openKeeWebBrowser,
        });
        this.addCommand({ // 在新窗口中打开 KeeWeb
            langKey: "open-keeweb-window",
            langText: this.i18n.menu.command.openKeeWebWindow.text,
            hotkey: "⌥⇧K", // Ctrl + Shift + Alt + K 无法触发, 使用 Shift + Alt + K 代替
            customHotkey: "",
            // callback: () => {
            //     /* 设置其他回调函数后, 本函数不会被调用 */
            // },
            globalCallback: () => {
                /**
                 * 设置后无论焦点是否在窗口内部, 都仅调用本函数
                 * 其他函数不会被调用
                 */
                this.openKeeWebWindow();
            },
        });
        // this.addCommand({ // 在新窗口中打开 KeeWeb
        //     langKey: "open-keeweb-window",
        //     langText: this.i18n.menu.command.openKeeWebWindow.text,
        //     hotkey: "⌥⇧⌘K",
        //     customHotkey: "⌥⇧⌘K",
        //     callback: () => this.openKeeWebWindow(false),
        // });
        // this.addCommand({ // 在新窗口中打开 KeeWeb (全局快捷键)
        //     langKey: "open-keeweb-window",
        //     langText: this.i18n.menu.command.openKeeWebWindow.text,
        //     hotkey: "⌥⇧⌘K", // 默认快捷键 Ctrl + Shift + Alt + K
        //     customHotkey: "⌥⇧⌘K", // 自定义快捷键
        //     globalCallback: () => this.openKeeWebWindow(true),
        // });

        this.loadData(KeepassPlugin.GLOBAL_CONFIG_NAME)
            .then(config => {
                if (config) {
                    this.config = mergeIgnoreArray(DEFAULT_CONFIG, config) as IConfig;
                }
                else {
                    this.config = mergeIgnoreArray(DEFAULT_CONFIG);
                }
            })
            .catch(error => this.logger.error(error))
            .finally(async () => {
                await this.initIDB();
                await this.initFiles();

                await this.loadIDB();
                await this.loadLocalStorage();
                await this.updateKeeWebPluginStatus();
                globalThis.addEventListener("storage", this.storageEventListener);
            });
    }

    onLayoutReady(): void {
        /* 添加菜单项 */
        this.topBarButton = this.addTopBar({
            icon: "icon-keepass-keeweb",
            title: this.displayName,
            position: "right",
            callback: e => {
                const menu = new siyuan.Menu(this.TOP_BAR_MENU_ID);
                menu.addItem({
                    icon: "iconLayout",
                    label: this.i18n.menu.command.openKeeWebTab.text,
                    click: this.openKeeWebTab,
                });
                menu.addItem({
                    icon: "iconLanguage",
                    label: this.i18n.menu.command.openKeeWebBrowser.text,
                    click: this.openKeeWebBrowser,
                });
                menu.addItem({
                    icon: "iconOpenWindow",
                    label: this.i18n.menu.command.openKeeWebWindow.text,
                    click: () => this.openKeeWebWindow(false),
                });
                menu.open({
                    x: globalThis.siyuan.coordinates.pageX,
                    y: globalThis.siyuan.coordinates.pageY,
                    isLeft: true,
                });
            },
        });
    }

    onunload(): void {
        globalThis.removeEventListener("storage", this.storageEventListener);
        this.saveLocalStorage();
        this.saveIDB();
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

    /**
     * 初始化 indexedDB
     */
    protected async initIDB(): Promise<void> {
        this.idb = {
            FilesCache: await openDB<IDBSchemaFiles>(
                KeepassPlugin.IDB_SCHEMA.FilesCache.name,
                undefined,
                this.createOpenDBCallbacks(KeepassPlugin.IDB_SCHEMA.FilesCache.name),
            ),
            PluginFiles: await openDB<IDBSchemaFiles>(
                KeepassPlugin.IDB_SCHEMA.PluginFiles.name,
                undefined,
                this.createOpenDBCallbacks(KeepassPlugin.IDB_SCHEMA.PluginFiles.name),
            ),
        };
    }

    /**
     * 初始化文件存储目录
     */
    protected async initFiles() {
        /* 创建目录 */
        await Promise.allSettled(KeepassPlugin.IDB_ENTRIES.map(
            ({ db, store }) => this.client.putFile({
                path: join(this.PLUGIN_STORAGE_IDB_PATH, db, store),
                isDir: true,
            }),
        ));

        /* 初始化文件 */
        await this.loadKeeWebPluginManifest();
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
        await this.updateKeeWebPluginStatus();
        return this.saveData(KeepassPlugin.GLOBAL_CONFIG_NAME, JSON.stringify(this.config, undefined, 4));
    }

    /* 删除 KeeWeb 用户配置 */
    public async deleteKeeWebUserConfig(): Promise<void> {
        /* 删除 localStorage 相关的内容 */
        this.removeLocalStorageItems();

        await Promise.allSettled([
            /* 删除 indexedDB 文件 */
            this.idb.FilesCache.clear(KeepassPlugin.IDB_SCHEMA.FilesCache.stores.files.name),
            this.idb.PluginFiles.clear(KeepassPlugin.IDB_SCHEMA.PluginFiles.stores.files.name),
        ]);
        
        /* 同步删除插件对应的数据 */
        await Promise.allSettled([
            this.saveLocalStorage(),
            this.saveIDB(),
        ]);

        /* 更新 KeeWeb 插件状态 */
        await this.updateKeeWebPluginStatus();
    }

    /* 更新 keeweb 插件状态 */
    public async updateKeeWebPluginStatus(): Promise<void> {
        switch (true) {
            case !this.isKeeWebSiyuanPluginInstalled && this.config.keeweb.plugin.siyuan.enable: // 需要安装插件
                await this.installKeeWebPlugin();
                break;

            case this.isKeeWebSiyuanPluginInstalled && !this.config.keeweb.plugin.siyuan.enable: // 需要卸载插件
                await this.uninstallKeeWebPlugin();
                break;
        }
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
            this.setLocalStorageItems(local);
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
    public setLocalStorageItem(key: string, value: any): void {
        globalThis.localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * 设置 KeeWeb 相关的 localStorage 项
     */
    public setLocalStorageItems(local: TLocal = this.local): void {
        for (const [key, value] of Object.entries(local)) {
            this.setLocalStorageItem(key, value);
        }
    }

    /**
     * 设置 localStorage 项
     */
    public getLocalStorageItem(key: string): any {
        const value = globalThis.localStorage.getItem(key);
        return value === null
            ? value
            : JSON.parse(value);
    }

    /**
     * 获取 KeeWeb 相关的 localStorage 项
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
     * 删除 KeeWeb 相关的 localStorage 项
     */
    public removeLocalStorageItems(): void {
        for (const key of Object.keys(globalThis.localStorage)) {
            if (this.isLocalStorageKey(key)) {
                globalThis.localStorage.removeItem(key);
            }
        }
    }

    /**
     * 加载 indexedDB
     */
    public async loadIDB() {
        for (const entry of KeepassPlugin.IDB_ENTRIES) {
            try {
                const path = join(this.PLUGIN_STORAGE_IDB_PATH, entry.db, entry.store);
                const response = await this.client.readDir({ path });
                const file_names_siyuan = response.data
                    .filter(entry => !entry.isDir)
                    .map(entry => entry.name);
                const file_names_idb = await this.idb[entry.db].getAllKeys(entry.store);

                const entries = sync1<string>(file_names_siyuan, file_names_idb);
                const transaction = this.idb[entry.db].transaction(entry.store, "readwrite");
                const store = transaction.objectStore(entry.store);
                const results = await Promise.allSettled([
                    ...[...entries.delete].map(file_name => store.delete(file_name)),
                    ...file_names_siyuan.map(file_name => (async () => {
                        const file = await this.client.getFile({ path: join(path, file_name) }, "arraybuffer");
                        await this.idb[entry.db].put(entry.store, file, file_name);
                    })()),
                    transaction.done,
                ]);

                results.forEach(result => {
                    if (result.status === "rejected") {
                        this.logger.warn(result.reason);
                    }
                });
            } catch (error) {
                this.logger.warn(error);
            }
        }
    }

    /**
     * 保存 indexedDB 中 KeeWeb 相关的数据  
     * 完整同步 `indexedDB` -> `data/storage/petal/keepass/idb`
     * @param names 需要保存的数据库名列表, 默认保存所有数据库
     */
    public async saveIDB(...names: TDBDatabaseName[]) {
        const db_name_set = new Set(names);
        const entries = db_name_set.size > 0
            ? KeepassPlugin.IDB_ENTRIES.filter(entry => db_name_set.has(entry.db))
            : KeepassPlugin.IDB_ENTRIES;

        for (const entry of entries) {
            try {
                const path = join(this.PLUGIN_STORAGE_IDB_PATH, entry.db, entry.store);
                const response = await this.client.readDir({ path });
                const file_names_siyuan = response.data
                    .filter(entry => !entry.isDir)
                    .map(entry => entry.name);
                const file_names_idb = await this.idb[entry.db].getAllKeys(entry.store);

                const entries = sync1<string>(file_names_idb, file_names_siyuan);
                const transaction = this.idb[entry.db].transaction(entry.store);
                const store = transaction.objectStore(entry.store);
                const results = await Promise.allSettled([
                    ...[...entries.delete].map(file_name => this.client.removeFile({ path: join(path, file_name) })),
                    ...file_names_idb.map(file_name => (async () => {
                        const file = await store.get(file_name);
                        return file
                            ? this.client.putFile({ path: join(path, file_name), file })
                            : undefined;
                    })()),
                    transaction.done,
                ]);

                results.forEach(result => {
                    if (result.status === "rejected") {
                        this.logger.warn(result.reason);
                    }
                });
            } catch (error) {
                this.logger.warn(error);
            }
        }
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
     * 创建 indexedDB 数据库的回调函数集
     * @param name 数据库名
     * @returns 回调函数集
     */
    protected createOpenDBCallbacks(name: TDBDatabaseName): OpenDBCallbacks<IDBSchemaFiles> {
        return {
            upgrade(db) {
                for (const [key, store] of Object.entries(KeepassPlugin.IDB_SCHEMA[name].stores)) {
                    db.createObjectStore(store.name);
                }
            },
        }
    }

    /**
     * 复制 keeweb 插件文件
     * @param type 文件类型
     */
    protected async copyKeeWebPluginFile(type: "js" | "css") {
        const file_name = `plugin.${type}`;
        const file_path = join(this.PLUGIN_INSTALL_PATH, "keeweb/plugins/siyuan", file_name);
        const file = await this.client.getFile({ path: file_path }, "blob");
        return this.client.putFile({
            path: join(
                this.PLUGIN_STORAGE_IDB_PATH,
                KeepassPlugin.IDB_SCHEMA.PluginFiles.name,
                KeepassPlugin.IDB_SCHEMA.PluginFiles.stores.files.name,
                `siyuan_${file_name}`,
            ),
            file,
        });
    }

    /**
     * 添加 keeweb 插件文件
     * @param type 文件类型
     */
    protected async putKeeWebPluginFile(type: "js" | "css") {
        const file_name = `plugin.${type}`;
        const idb_key = `${this.manifest.name}_${file_name}`;
        const file_path = join(this.PLUGIN_INSTALL_PATH, "keeweb/plugins/siyuan", file_name);
        const file = await this.client.getFile({ path: file_path }, "arraybuffer");
        await this.idb.PluginFiles.put(KeepassPlugin.IDB_SCHEMA.PluginFiles.stores.files.name, file, idb_key);
    }

    /**
     * 删除 keeweb 插件文件
     * @param type 文件类型
     */
    protected async deleteKeeWebPluginFile(type: "js" | "css") {
        const idb_key = `${this.manifest.name}_plugin.${type}`;
        await this.idb.PluginFiles.delete(KeepassPlugin.IDB_SCHEMA.PluginFiles.stores.files.name, idb_key);
    }

    /**
     * 加载 keeweb 思源插件的配置清单文件
     */
    protected async loadKeeWebPluginManifest(): Promise<ILocalStoragePluginManifest> {
        if (!this.manifest) {
            this.manifest = await this.client.getFile({
                path: join(
                    this.PLUGIN_INSTALL_PATH,
                    "keeweb/plugins/siyuan",
                    "manifest.json",
                ),
            }, "json") as ILocalStoragePluginManifest;
        }
        return this.manifest;
    }

    /**
     * 保存 keeweb 思源插件的配置
     * keeweb -> 思源
     * 在 localStorage 变更时调用
     */
    protected saveKeeWebPluginConfig(): void {
        const plugins: ILocalStoragePlugins | undefined = this.local[KeepassPlugin.LOCAL_STORAGE_KEY_PLUGINS];
        const plugin: ILocalStoragePlugin | undefined = plugins?.plugins?.find(plugin => plugin?.manifest?.name === this.manifest.name);

        if (plugin) { // 存在插件配置 (插件已安装)
            this.config.keeweb.plugin.siyuan.enable = true;
        }
        else { // 不存在插件配置 (插件已卸载)
            this.config.keeweb.plugin.siyuan.enable = false;
        }
    }

    /* 获取 keeweb 中思源插件的状态 */
    protected getKeeWebSiyuanPlugin(): {
        plugins: ILocalStoragePlugins,
        plugin: ILocalStoragePlugin | undefined,
    } {
        var plugins: ILocalStoragePlugins | undefined = this.local[KeepassPlugin.LOCAL_STORAGE_KEY_PLUGINS];
        var plugin: ILocalStoragePlugin | undefined;
        if (plugins) { // 插件配置存在
            if (Array.isArray(plugins.plugins)) {
                plugin = plugins.plugins.find(plugin => plugin?.manifest?.name === this.manifest.name)
            }
            else {
                plugins.plugins = [];
            }
        }
        else { // 插件配置不存在, 初始化插件配置
            plugins = {
                autoUpdateDate: null,
                autoUpdateAppVersion: null,
                plugins: [],
            };
            this.local[KeepassPlugin.LOCAL_STORAGE_KEY_PLUGINS] = plugins;
        }
        return {
            plugins,
            plugin,
        };
    }

    public get isKeeWebSiyuanPluginInstalled(): boolean {
        const { plugin } = this.getKeeWebSiyuanPlugin();
        return !!plugin;
    }

    /**
     * 安装 keeweb 插件
     */
    public async installKeeWebPlugin(): Promise<void> {
        var { plugins, plugin } = this.getKeeWebSiyuanPlugin();

        /* 更新 this.local 与 this.config  */
        if (!plugin) { // 不存在插件配置 (插件未安装)
            plugins.plugins.push({
                manifest: this.manifest,
                url: this.KEEWEB_PLUGIN_PATHANEM,
                enabled: true,
                autoUpdate: true,
            });
        }
        this.config.keeweb.plugin.siyuan.enable = true;
        this.setLocalStorageItem(KeepassPlugin.LOCAL_STORAGE_KEY_PLUGINS, plugins);

        /* 添加插件文件到 idb */
        await Promise.allSettled([
            this.putKeeWebPluginFile("js"),
            this.putKeeWebPluginFile("css"),
        ]);

        /* 保存配置 */
        await Promise.allSettled([
            this.saveIDB(KeepassPlugin.IDB_SCHEMA.PluginFiles.name), // 保存 IDB "PluginFiles"
            this.saveLocal(), // 保存 local
            this.updateConfig(), // 保存 config
        ]);
    }

    /**
     * 卸载 keeweb 插件
     */
    public async uninstallKeeWebPlugin(): Promise<void> {
        const { plugins, plugin } = this.getKeeWebSiyuanPlugin();

        /* 更新 this.local 与 this.config  */
        if (plugin) { // 存在插件配置 (插件已安装)
            const index = plugins.plugins.indexOf(plugin);
            plugins.plugins.splice(index, 1);
        }
        this.config.keeweb.plugin.siyuan.enable = false;
        this.setLocalStorageItem(KeepassPlugin.LOCAL_STORAGE_KEY_PLUGINS, plugins);

        /* 添加插件文件到 idb */
        await Promise.allSettled([
            this.deleteKeeWebPluginFile("js"),
            this.deleteKeeWebPluginFile("css"),
        ]);

        /* 保存配置 */
        await Promise.allSettled([
            this.saveIDB(KeepassPlugin.IDB_SCHEMA.PluginFiles.name), // 保存 IDB "PluginFiles"
            this.saveLocal(), // 保存 local
            this.updateConfig(), // 保存 config
        ]);
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

                switch (e.key) {
                    case KeepassPlugin.LOCAL_STORAGE_KEY_PLUGINS:
                        this.saveKeeWebPluginConfig();
                        await this.saveIDB(KeepassPlugin.IDB_SCHEMA.PluginFiles.name);
                        break;

                    case KeepassPlugin.LOCAL_STORAGE_KEY_FILE_INFO:
                        await this.saveIDB(KeepassPlugin.IDB_SCHEMA.FilesCache.name);
                        break;

                    default:
                        break;
                }
            }

            if (save) {
                await this.saveLocal();
            }
        }
    };

    /**
     * 在新页签中打开 KeeWeb
     */
    protected readonly openKeeWebTab = async () => {
        siyuan.openTab({
            app: this.app,
            custom: {
                icon: "icon-keepass-keeweb",
                title: "KeeWeb",
                id: this.CUSTOM_TAB_ID_KEEWEB,
                data: {
                    src: this.KEEWEB_INDEX_URL.href,
                    title: "KeeWeb",
                },
            },
            keepCursor: false,
            removeCurrentTab: false,
        });
    };

    /**
     * 在浏览器中打开 KeeWeb
     */
    protected readonly openKeeWebBrowser = async () => {
        globalThis.open(this.KEEWEB_INDEX_URL.href);
    };

    /**
     * 在新窗口中打开 KeeWeb
     */
    protected readonly openKeeWebWindow = async (global: boolean = !isWindowFocused()) => {
        openWindow({
            url: this.KEEWEB_INDEX_URL,
            base: {
                center: global || this.config.window.center,
                width: this.config.window.width,
                height: this.config.window.height,
                alwaysOnTop: this.config.window.alwaysOnTop,
                x: globalThis.siyuan.coordinates?.screenX ?? 0,
                y: globalThis.siyuan.coordinates?.screenY ?? 0,
            },
            extra: {
                enableMenuBar: true,
            },
        });
    };
};

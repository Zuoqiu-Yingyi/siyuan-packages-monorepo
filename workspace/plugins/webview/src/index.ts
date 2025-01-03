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

import * as sdk from "@siyuan-community/siyuan-sdk";
import siyuan from "siyuan";
import { mount } from "svelte";

import {
    FLAG_DESKTOP,
    FLAG_ELECTRON,
    FLAG_MOBILE,
} from "@workspace/utils/env/front-end";
import { Logger } from "@workspace/utils/logger";
import { merge } from "@workspace/utils/misc/merge";
import { src2url } from "@workspace/utils/misc/url";
import { isMatchedMouseEvent } from "@workspace/utils/shortcut/match";
import { EditorType } from "@workspace/utils/siyuan";
import { getBlockID } from "@workspace/utils/siyuan/dom";
import {
    pathname2icon,
    type2icon,
} from "@workspace/utils/siyuan/icon";
import {
    getBlockMenuContext,
    type BlockMenuDetail,
} from "@workspace/utils/siyuan/menu/block";
import { washMenuItems } from "@workspace/utils/siyuan/menu/wash";
import {
    buildSiyuanWebURL,
    editorType2Pathname,
    isStaticPathname,
    parseSiyuanURL,
    parseSiyuanWebURL,
    Pathname,
} from "@workspace/utils/siyuan/url";

import Settings from "./components/Settings.svelte";
import Webview from "./components/Webview.svelte";

import icon_webview_anchor from "./assets/symbols/icon-webview-anchor.symbol?raw";
import icon_webview_browser from "./assets/symbols/icon-webview-browser.symbol?raw";
import icon_webview_chromium from "./assets/symbols/icon-webview-chromium.symbol?raw";
import icon_webview_click from "./assets/symbols/icon-webview-click.symbol?raw";
import icon_webview_select from "./assets/symbols/icon-webview-select.symbol?raw";
import icon_webview_title from "./assets/symbols/icon-webview-title.symbol?raw";
import { DEFAULT_CONFIG } from "./configs/default";
import {
    openNewWindow,
    type IOverwrite,
    type IWebPreferences,
} from "./utils/window";

import type { BlockID } from "@workspace/types/siyuan";
import type {
    IClickBlockIconEvent,
    IClickEditorTitleIconEvent,
    IOpenMenuBlockRefEvent,
    IOpenMenuFileAnnotationRefEvent,
    IOpenMenuImageEvent,
    IOpenMenuLinkEvent,
} from "@workspace/types/siyuan/events";
import type { IPosition } from "@workspace/utils/dom/position";

import type {
    IConfig,
    IProtocols,
    ITargets,
} from "./types/config";
import type { I18N } from "./utils/i18n";

export default class WebviewPlugin extends siyuan.Plugin {
    static readonly GLOBAL_CONFIG_NAME = "global-config.json";
    static readonly WEBVIEW_TAB_TYPE = "-webview-tag";

    // @ts-expect-error ignore original type
    declare public readonly i18n: I18N;

    public readonly siyuan = siyuan;
    public readonly logger: InstanceType<typeof Logger>;
    public readonly client: InstanceType<typeof sdk.Client>;

    protected readonly TOP_BAR_MENU_ID: string;
    protected readonly SETTINGS_DIALOG_ID: string;
    protected readonly WEBVIEW_TAB_ID: string;
    protected readonly webview_tab: ReturnType<siyuan.Plugin["addTab"]>;
    protected tab_bar_item!: ReturnType<siyuan.Plugin["addTopBar"]>;
    protected config!: IConfig;

    constructor(options: any) {
        super(options);

        this.logger = new Logger(this.name);
        this.client = new sdk.Client(undefined, "fetch");

        this.TOP_BAR_MENU_ID = `${this.name}-top-bar-menu`;
        this.SETTINGS_DIALOG_ID = `${this.name}-settings-dialog`;
        this.WEBVIEW_TAB_ID = `${this.name}${WebviewPlugin.WEBVIEW_TAB_TYPE}`;

        // eslint-disable-next-line ts/no-this-alias
        const plugin = this;
        this.webview_tab = this.addTab({
            type: WebviewPlugin.WEBVIEW_TAB_TYPE,
            init() {
                // pluginContext.logger.debug(this)

                // const target = document.createElement("div");
                // (this.element as HTMLElement).append(target);

                // eslint-disable-next-line ts/no-this-alias
                const tab = this;
                mount(Webview, {
                    // target,
                    target: tab.element,
                    props: {
                        src: tab.data.href,
                        tab,
                        plugin,
                        title: tab.data.title,
                    },
                });
            },
        });
    }

    public override onload(): void {
        /* 注册图标 */
        this.addIcons([
            icon_webview_anchor,
            icon_webview_browser,
            icon_webview_chromium,
            icon_webview_click,
            icon_webview_select,
            icon_webview_title,
        ].join(""));

        /**
         * 注册快捷键命令
         * 在 onload 结束后即刻解析, 因此不能在回调函数中注册
         */
        this.addCommand({
            langKey: "openDesktopWindow",
            langText: this.i18n.menu.openDesktopWindow.label,
            hotkey: "⇧⌘N", // 默认快捷键
            customHotkey: "", // 自定义快捷键
            callback: () => {
                this.openSiyuanDesktopWindow();
            },
        });
        this.addCommand({
            langKey: "openMobildWindow",
            langText: this.i18n.menu.openMobildWindow.label,
            hotkey: "", // 默认快捷键
            customHotkey: "", // 自定义快捷键
            callback: () => {
                this.openSiyuanMobileWindow();
            },
        });
        this.addCommand({
            langKey: "openNewTab",
            langText: this.i18n.menu.openNewTab.label,
            hotkey: "⌘T", // 默认快捷键
            customHotkey: "", // 自定义快捷键
            callback: () => {
                this.openWebviewTab(undefined, this.i18n.menu.openNewTab.title);
            },
        });

        // this.logger.debug(this);
        this.loadData(WebviewPlugin.GLOBAL_CONFIG_NAME)
            .then((config) => {
                this.config = merge(DEFAULT_CONFIG, config || {}) as IConfig;
            })
            .catch((error) => this.logger.error(error))
            .finally(() => {
                if (FLAG_ELECTRON && FLAG_DESKTOP) {
                    /* 注册触发打开页签动作的监听器 */
                    globalThis.addEventListener(this.config.tab.open.mouse.type, this.openTabEventListener, true);
                }
                globalThis.addEventListener(this.config.window.open.mouse.type, this.openWindowEventListener, true);

                /* 文档块菜单 */
                this.eventBus.on("click-editortitleicon", this.blockMenuEventListener);
                /* 其他块菜单 */
                this.eventBus.on("click-blockicon", this.blockMenuEventListener);
                /* 块引用菜单 */
                this.eventBus.on("open-menu-blockref", this.blockRefMenuEventListener);
                /* 超链接菜单 */
                this.eventBus.on("open-menu-link", this.linkMenuEventListener);
                /* 图片菜单 */
                this.eventBus.on("open-menu-image", this.imageMenuEventListener);
                /* 资源菜单 */
                this.eventBus.on("open-menu-fileannotationref", this.fileAnnotationRefMenuEventListener);
            });
    }

    public override onLayoutReady(): void {
        // this.openSetting();
        if (FLAG_DESKTOP) {
            /* 顶部工具栏菜单 */
            // const menu = new siyuan.Menu(this.TOP_BAR_MENU_ID);
            this.tab_bar_item = this.addTopBar({
                icon: "icon-webview-chromium",
                title: this.i18n.displayName,
                position: "right",
                callback: (_e) => {
                    // this.logger.debug(e);
                    const menu = new siyuan.Menu(this.TOP_BAR_MENU_ID);

                    /* 菜单项 - 打开桌面端窗口 */
                    menu.addItem({
                        icon: "iconSiYuan",
                        label: this.i18n.menu.openDesktopWindow.label,
                        click: (_element) => {
                            this.openSiyuanDesktopWindow({
                                screenX: window.siyuan.coordinates?.screenX,
                                screenY: window.siyuan.coordinates?.screenY,
                            });
                        },
                    });

                    /* 菜单项 - 打开移动端窗口 */
                    menu.addItem({
                        icon: "iconSiYuan",
                        label: this.i18n.menu.openMobildWindow.label,
                        click: (_element) => {
                            this.openSiyuanMobileWindow({
                                screenX: window.siyuan.coordinates?.screenX,
                                screenY: window.siyuan.coordinates?.screenY,
                            });
                        },
                    });

                    menu.addSeparator();

                    /* 菜单项 - 打开空白页签窗口 */
                    menu.addItem({
                        icon: "iconLayout",
                        label: this.i18n.menu.openNewTab.label,
                        click: (_element) => {
                            this.openWebviewTab(undefined, this.i18n.menu.openNewTab.title);
                        },
                    });

                    /* 打开菜单 */
                    if (FLAG_MOBILE) {
                        menu.fullscreen();
                    }
                    else {
                        menu.open({
                            x: window.siyuan?.coordinates?.pageX ?? 0,
                            y: window.siyuan?.coordinates?.pageY ?? 0,
                            isLeft: true,
                        });
                    }
                },
            });
        }
    }

    public override onunload(): void {
        if (FLAG_ELECTRON && FLAG_DESKTOP) {
            /* 移除触发打开页签动作的监听器 */
            globalThis.removeEventListener(this.config.tab.open.mouse.type, this.openTabEventListener, true);
        }
        globalThis.removeEventListener(this.config.window.open.mouse.type, this.openWindowEventListener, true);

        this.eventBus.off("click-blockicon", this.blockMenuEventListener);
        this.eventBus.off("click-editortitleicon", this.blockMenuEventListener);
        this.eventBus.off("open-menu-blockref", this.blockRefMenuEventListener);
        this.eventBus.off("open-menu-link", this.linkMenuEventListener);
        this.eventBus.off("open-menu-image", this.imageMenuEventListener);
        this.eventBus.off("open-menu-fileannotationref", this.fileAnnotationRefMenuEventListener);
    }

    public override openSetting(): void {
        // eslint-disable-next-line ts/no-this-alias
        const plugin = this;
        const dialog = new siyuan.Dialog({
            title: `${this.i18n.displayName} <code class="fn__code">${this.name}</code>`,
            content: `<div id="${plugin.SETTINGS_DIALOG_ID}" class="fn__flex-column" />`,
            width: FLAG_MOBILE ? "92vw" : "720px",
            height: FLAG_MOBILE ? undefined : "640px",
        });
        const target = dialog.element.querySelector(`#${plugin.SETTINGS_DIALOG_ID}`);
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
        return this.updateConfig(merge(DEFAULT_CONFIG) as IConfig);
    }

    /* 更新插件配置 */
    public async updateConfig(config?: IConfig): Promise<void> {
        if (config && config !== this.config) {
            this.config = config;
        }
        return this.saveData(WebviewPlugin.GLOBAL_CONFIG_NAME, JSON.stringify(this.config, undefined, 4));
    }

    /* 获得 UA */
    public get useragent(): string {
        return this.config.general.useragent || globalThis.navigator.userAgent;
    }

    /* 获得背景颜色 */
    public get background(): string {
        return this.config.general.background;
    }

    /** 
     * 打开新标签页
     * @param href - 访问地址
     * @param title - 页签标题
     * @param icon - 页签图标
     * @param options - 页签其他选项
     */
    public openWebviewTab(
        href: string = "about:blank",
        title?: string,
        icon: string = "icon-webview-chromium",
        options: object = {},
    ) {
        siyuan.openTab({
            app: this.app,
            custom: {
                icon,
                title: title || this.displayName,
                id: this.WEBVIEW_TAB_ID,
                data: {
                    href,
                    title: title || this.displayName,
                },
            },
            keepCursor: false,
            removeCurrentTab: false,
            ...options,
        });
    }

    /* 打开新窗口 */
    public openWindow(
        href: string,
        params: IOverwrite = {
            x: 0,
            y: 0,
            title: "",
        },
        webPreferences: IWebPreferences = {
            defaultFontSize: window.siyuan.config!.editor.fontSize,
            defaultFontFamily: {
                standard: window.siyuan.config!.editor.fontFamily,
            },
        },
    ) {
        try {
            const url = new URL(href);
            const window = openNewWindow(
                url,
                {
                    backgroundColor: this.background,
                    ...this.config.window.params,
                },
                params,
                webPreferences,
                this,
            );
            return window;
        }
        catch (err) {
            this.logger.warn(err);
            return null;
        }
    }

    /**
     * 在新窗口打开网页
     * @param href - 地址
     * @param title - 标题
     * @param e - 位置信息
     */
    public openWebpageWindow(
        href: string,
        title: string,
        e?: IPosition | MouseEvent,
    ) {
        const params = {
            x: e?.screenX ?? 0,
            y: e?.screenY ?? 0,
            title,
            alwaysOnTop: false, // 禁用置顶
            autoHideMenuBar: true, // 自动隐藏菜单栏
            webPreferences: {
                nodeIntegration: false, // 是否启用 Node.js 内置模块
                webviewTag: false, // 是否启用 webview 标签
                contextIsolation: false, // 是否开启上下文隔离, 设置 false 之后可以使用 require
            },

            enableMenuBar: true, // (自定义) 启用菜单栏
            enableElectron: false, // (自定义) 启用 Electron 环境
        };
        return this.openWindow(href, params);
    }

    /* 打开思源桌面端窗口 */
    public openSiyuanDesktopWindow(
        e?: IPosition | MouseEvent,
        href?: string,
    ): void {
        const params = {
            x: e?.screenX ?? 0,
            y: e?.screenY ?? 0,
            title: "desktop",
            alwaysOnTop: false, // 桌面端禁用置顶
            autoHideMenuBar: false, // 禁用自动隐藏菜单栏
            webPreferences: {
                nodeIntegration: true, // 是否启用 Node.js 内置模块
                webviewTag: true, // 是否启用 webview 标签
                contextIsolation: false, // 是否开启上下文隔离, 设置 false 之后可以使用 require
            },

            enableMenuBar: true, // (自定义) 启用菜单栏
            enableElectron: true, // (自定义) 启用 Electron 环境
        };
        this.openWindow(href || buildSiyuanWebURL(Pathname.desktop).href, params);
    }

    /* 打开思源移动端窗口 */
    public openSiyuanMobileWindow(
        e?: IPosition | MouseEvent,
        href?: string,
    ): void {
        const params = {
            x: e?.screenX ?? 0,
            y: e?.screenY ?? 0,
            title: "mobile",
            alwaysOnTop: true, // 移动端启用置顶
            autoHideMenuBar: false,
            webPreferences: {
                nodeIntegration: true,
                webviewTag: true,
                contextIsolation: false,
            },

            enableMenuBar: true,
            enableElectron: true,
        };
        this.openWindow(href || buildSiyuanWebURL(Pathname.mobile).href, params);
    }

    /* 打开思源原生窗口 */
    public openSiyuanNativeWindow(
        e?: IPosition | MouseEvent,
        url?: URL,
    ): void {
        const params = parseSiyuanWebURL(url);
        if (params) {
            const options = {
                position: this.config.window.params.center
                    ? undefined
                    : {
                            x: e?.screenX ?? 0,
                            y: e?.screenY ?? 0,
                        },
                height: this.config.window.params.height,
                width: this.config.window.params.height,
                doc: {
                    id: params.id,
                },
            };

            // this.logger.debug(options);
            this.siyuan.openWindow(options);
        }
    }

    /* 打开思源窗口 */
    public openSiyuanWindow(
        url: URL,
        e?: IPosition | MouseEvent,
        editorType: EditorType = this.config.window.siyuan.editorType,
    ): void {
        switch (editorType) {
            case EditorType.desktop:
                this.openSiyuanDesktopWindow(e, url.href);
                break;

            case EditorType.mobile:
                this.openSiyuanMobileWindow(e, url.href);
                break;

            case EditorType.window:
                this.openSiyuanNativeWindow(e, url);
                break;
        }
    }

    /* 通过 ID 打开思源窗口 */
    public openSiyuanWindowByID(
        id: BlockID,
        focus: boolean = false,
        editorType: EditorType = this.config.window.siyuan.editorType,
    ): void {
        const url = buildSiyuanWebURL(
            editorType2Pathname(editorType),
            {
                id,
                focus,
            },
        );

        this.openSiyuanWindowByURL(url, editorType);
    }

    /* 通过 URL 打开思源窗口 */
    public openSiyuanWindowByURL(
        url: URL,
        editorType: EditorType = this.config.window.siyuan.editorType,
    ): void {
        this.openSiyuanWindow(
            url,
            {
                screenX: window.siyuan.coordinates?.screenX,
                screenY: window.siyuan.coordinates?.screenY,
            },
            editorType,
        );
    }

    /* 是否为有效的 URL 协议 */
    protected isUrlSchemeAvailable(url: string, protocols: IProtocols): boolean {
        for (const protocol of Object.values(protocols)) {
            if (protocol.enable && url.startsWith(protocol.prefix)) {
                return true;
            }
        }
        return false;
    }

    /* 是否为有效的静态文件路径 */
    protected isFilePathnameAvailable(pathname: string, protocols: IProtocols): boolean {
        if (isStaticPathname(pathname)) {
            for (const protocol of Object.values(protocols)) {
                if (protocol.enable && pathname.startsWith(protocol.prefix)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 获取超链接的元数据
     * @param element - 超链接元素
     * @param targets - 目标配置
     */
    protected parseHyperlinkMeta(element: HTMLElement, targets: ITargets) {
        const meta = {
            valid: false, // 是否为有效的超链接
            enabled: false, // 是否为激活的超链接
            href: "", // 超链接目标
            title: "", // 超链接标题/锚文本
        };
        switch (element.localName) {
            case "a":
                meta.valid = true;
                meta.enabled = targets.hyperlink.other.enable;
                // meta.href = (element as HTMLAnchorElement).href || "";
                meta.href = element.getAttribute("href") || "";
                meta.title = element.title || element.textContent || "";
                break;
            case "span":
                if (/\ba\b/.test(element.dataset.type ?? "")) {
                    meta.valid = true;
                    meta.enabled = targets.hyperlink.editor.enable;
                    meta.href = element.dataset.href || "";
                    meta.title = element.dataset.title || element.textContent || "";
                }
                break;
            default:
                break;
        }
        return meta;
    }

    /**
     * 构造块打开块菜单
     * @param id - 块 ID
     * @param focus - 是否聚焦
     * @returns 菜单项列表
     */
    protected buildOpenBlockSubmenu(
        id: BlockID,
        focus: boolean = false,
    ): siyuan.IMenu[] {
        const options: Parameters<typeof siyuan.openTab>[0] = {
            app: this.app,
            doc: {
                id,
                action: [
                    "cb-get-focus", // 光标定位到块
                    "cb-get-hl", // 高亮块
                ],
                zoomIn: focus,
            },
        };

        const submenu: siyuan.IMenu[] = [
            {
                /* 在新页签中打开 */
                icon: "iconAdd",
                label: this.i18n.menu.openTab.label,
                click: () => {
                    siyuan.openTab({
                        ...options,
                        keepCursor: false, // 焦点不跳转到新 tab
                        removeCurrentTab: false, // 不移除原页签
                    });
                },
            },
            {
                /* 在后台页签中打开 */
                icon: "iconMin",
                label: this.i18n.menu.openTabBackground.label,
                click: () => {
                    siyuan.openTab({
                        ...options,
                        keepCursor: true, // 焦点不跳转到新 tab
                        removeCurrentTab: false, // 不移除原页签
                    });
                },
            },
            {
                /* 在页签右侧打开 */
                icon: "iconLayoutRight",
                label: this.i18n.menu.openTabRight.label,
                click: () => {
                    siyuan.openTab({
                        ...options,
                        position: "right",
                        keepCursor: false, // 焦点不跳转到新 tab
                        removeCurrentTab: false, // 不移除原页签
                    });
                },
            },
            {
                /* 在页签下侧打开 */
                icon: "iconLayoutBottom",
                label: this.i18n.menu.openTabBottom.label,
                click: () => {
                    siyuan.openTab({
                        ...options,
                        position: "bottom",
                        keepCursor: false, // 焦点不跳转到新 tab
                        removeCurrentTab: false, // 不移除原页签
                    });
                },
            },
            {
                type: "separator",
            },
            {
                /* 在新窗口打开 */
                icon: "iconOpenWindow",
                label: this.i18n.menu.openEditor.label,
                click: () => this.openSiyuanWindowByID(id, false),
            },
            {
                /* 新窗口打开块并聚焦 */
                icon: "iconFocus",
                label: this.i18n.menu.openFocusedEditor.label,
                click: () => this.openSiyuanWindowByID(id, true),
            },
        ];

        return submenu;
    }

    /**
     * 构造网页打开菜单
     * @param href - 超链接地址
     * @param title - 标题
     * @param icon - 图标
     * @returns 菜单项列表
     */
    protected buildOpenLinkSubmenu(
        href: string,
        title: string,
        icon?: string,
    ): siyuan.IMenu[] {
        const submenu: siyuan.IMenu[] = [
            {
                /* 在新页签中打开 */
                icon: "iconAdd",
                label: this.i18n.menu.openTab.label,
                click: () => this.openWebviewTab(
                    href,
                    title,
                    icon,
                ),
            },
            {
                /* 在后台页签中打开 */
                icon: "iconMin",
                label: this.i18n.menu.openTabBackground.label,
                click: () => this.openWebviewTab(
                    href,
                    title,
                    icon,
                    { keepCursor: true },
                ),
            },
            {
                /* 在页签右侧打开 */
                icon: "iconLayoutRight",
                label: this.i18n.menu.openTabRight.label,
                click: () => this.openWebviewTab(
                    href,
                    title,
                    icon,
                    { position: "right" },
                ),
            },
            {
                /* 在页签下侧打开 */
                icon: "iconLayoutBottom",
                label: this.i18n.menu.openTabBottom.label,
                click: () => this.openWebviewTab(
                    href,
                    title,
                    icon,
                    { position: "bottom" },
                ),
            },
            {
                type: "separator",
            },
            {
                /* 使用新窗口打开 */
                icon: "iconOpenWindow",
                label: this.i18n.menu.openByNewWindow.label,
                click: () => (this.openWebpageWindow(
                    href,
                    title,
                    {
                        screenX: window.siyuan.coordinates?.screenX,
                        screenY: window.siyuan.coordinates?.screenY,
                    },
                )),
            },
        ];

        return submenu;
    }

    /* 块引用菜单 */
    protected readonly blockRefMenuEventListener = (e: IOpenMenuBlockRefEvent) => {
        // this.logger.debug(e);

        const element = e.detail.element; // 块引用 DOM 元素
        const id = element.dataset.id; // 块引用目标块 ID
        if (!id) {
            return;
        }

        const submenu: siyuan.IMenu[] = [];

        /* 新窗口打开块 */
        submenu.push({
            icon: "iconOpenWindow",
            label: this.i18n.menu.openEditor.label,
            click: () => this.openSiyuanWindowByID(id, false),
        });

        /* 新窗口打开块并聚焦 */
        submenu.push({
            icon: "iconFocus",
            label: this.i18n.menu.openFocusedEditor.label,
            click: () => this.openSiyuanWindowByID(id, true),
        });

        e.detail.menu.addItem({
            icon: "icon-webview-chromium",
            label: this.i18n.displayName,
            submenu: washMenuItems(submenu),
        });
    };

    /* 超链接菜单 */
    protected readonly linkMenuEventListener = (e: IOpenMenuLinkEvent) => {
        // this.logger.debug(e);
        const submenu: siyuan.IMenu[] = [];

        const element = e.detail.element; // 超链接元素
        const link = this.parseHyperlinkMeta(element, this.config.tab.open.targets);

        switch (true) {
            /* 思源超链接 */
            case link.href.startsWith("siyuan:"): {
                const url = new URL(link.href);
                const param = parseSiyuanURL(url);

                if (param) {
                    submenu.push(...this.buildOpenBlockSubmenu(param.id, param.focus));
                }
                break;
            }

            /* 静态文件服务超链接 */
            case isStaticPathname(link.href): {
                const href = link.href.startsWith("/")
                    ? `${globalThis.location.origin}${link.href}`
                    : `${globalThis.document.baseURI}${link.href}`;
                const icon = pathname2icon(link.href);

                submenu.push(...this.buildOpenLinkSubmenu(href, link.title, icon));
                break;
            }

            /* 其他超链接 */
            default: {
                submenu.push(...this.buildOpenLinkSubmenu(link.href, link.title, "icon-webview-chromium"));
                break;
            }
        }

        e.detail.menu.addItem({
            icon: "icon-webview-chromium",
            label: this.i18n.displayName,
            submenu: washMenuItems(submenu),
        });
    };

    /* 图片菜单 */
    protected readonly imageMenuEventListener = (e: IOpenMenuImageEvent) => {
        // this.logger.debug(e);

        const element = e.detail.element.querySelector("img"); // 图片元素
        if (element) {
            const submenu = this.buildOpenLinkSubmenu(element.src, element.title || element.alt, "iconImage");

            e.detail.menu.addItem({
                icon: "icon-webview-chromium",
                label: this.i18n.displayName,
                submenu: washMenuItems(submenu),
            });
        }
    };

    /* 图片菜单 */
    protected readonly fileAnnotationRefMenuEventListener = (e: IOpenMenuFileAnnotationRefEvent) => {
        // this.logger.debug(e);

        try {
            const element = e.detail.element;
            const src = element.dataset.id!.replace(/\/\d{14}-[0-9a-z]{7}$/, ""); // 资源文件路径
            const url = src2url(src);
            const submenu = this.buildOpenLinkSubmenu(url.href, element.textContent!, "iconPDF");

            e.detail.menu.addItem({
                icon: "icon-webview-chromium",
                label: this.i18n.displayName,
                submenu: washMenuItems(submenu),
            });
        }
        catch (error) {
            this.logger.warn(error);
        }
    };

    /* 块菜单 */
    protected readonly blockMenuEventListener = (e: IClickBlockIconEvent | IClickEditorTitleIconEvent) => {
        // this.logger.debug(e);
        const detail = e.detail;
        const context = getBlockMenuContext(e.detail as BlockMenuDetail);
        if (context) {
            const submenu: siyuan.IMenu[] = [];

            if (!context.isDocumentBlock // 不是文档块
                && !context.isMultiBlock // 不是多个块
            ) {
                /* 打开块内资源 */
                let element: HTMLAudioElement | HTMLIFrameElement | HTMLVideoElement | null = null;
                switch (context.type) {
                    case sdk.siyuan.NodeType.NodeAudio:
                        element = context.element.querySelector("audio");
                        break;
                    case sdk.siyuan.NodeType.NodeVideo:
                        element = context.element.querySelector("video");
                        break;
                    case sdk.siyuan.NodeType.NodeIFrame:
                    case sdk.siyuan.NodeType.NodeWidget:
                        element = context.element.querySelector("iframe");
                        break;

                    default:
                        break;
                }
                if (element) {
                    const url = new URL(element.src);
                    if (context.type === sdk.siyuan.NodeType.NodeWidget) {
                        url.searchParams.set("id", context.id);
                    }
                    submenu.push({
                        icon: "iconImage",
                        label: this.i18n.menu.openResource.label,
                        submenu: this.buildOpenLinkSubmenu(url.href, context.type, type2icon(context.type)),
                    }, {
                        type: "separator",
                    });
                }
            }

            submenu.push(...this.buildOpenBlockSubmenu(context.id, false));

            detail.menu.addItem({
                icon: "icon-webview-chromium",
                label: this.i18n.displayName,
                submenu: washMenuItems(submenu),
            });
        }
    };

    /* 打开标签页 */
    protected readonly openTabEventListener = (e: Event) => {
        try {
            // this.logger.debug(e);

            if (!(e instanceof MouseEvent))
                return;

            /* 判断功能是否已启用 */
            if (!this.config.tab.enable)
                return;

            /* 判断事件是否为目标事件 */
            if (!isMatchedMouseEvent(e, this.config.tab.open.mouse))
                return;

            const meta = this.parseHyperlinkMeta(e.target as HTMLElement, this.config.tab.open.targets);

            /* 判断目标元素是否为有效的超链接 */
            if (meta.valid) {
                this.logger.info(meta);

                /* 仅访问允许访问的超链接 */
                if (meta.enabled) {
                    const flag_open = (() => {
                        switch (true) {
                            case this.isUrlSchemeAvailable(meta.href, this.config.tab.open.protocols):
                                return true;

                            case this.isFilePathnameAvailable(meta.href, this.config.tab.open.pathnames):
                                meta.href = `${globalThis.document.baseURI}${meta.href}`;
                                return true;

                            default:
                                return false;
                        }
                    })();

                    if (flag_open) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.openWebviewTab(meta.href, meta.title);
                    }
                }
            }
        }
        catch (error) {
            this.logger.warn(error);
        }
    };

    /* 打开窗口 */
    protected readonly openWindowEventListener = (e: Event) => {
        try {
            // this.logger.debug(e);

            if (!(e instanceof MouseEvent))
                return;

            /* 判断功能是否已启用 */
            if (!this.config.window.enable)
                return;

            /* 判断事件是否为目标事件 */
            if (!isMatchedMouseEvent(e, this.config.window.open.mouse))
                return;

            const meta = this.parseHyperlinkMeta(e.target as HTMLElement, this.config.window.open.targets);

            /* 判断目标元素是否为有效的超链接 */
            if (meta.valid) { // 目标为有效的超链接
                this.logger.info(meta);

                /* 仅访问允许访问的超链接 */
                if (meta.enabled) {
                    const flag_open = (() => {
                        switch (true) {
                            case this.isUrlSchemeAvailable(meta.href, this.config.window.open.protocols):
                                return true;

                            case this.isFilePathnameAvailable(meta.href, this.config.window.open.pathnames):
                                meta.href = `${globalThis.document.baseURI}${meta.href}`;
                                return true;

                            default:
                                return false;
                        }
                    })();

                    if (flag_open) {
                        e.preventDefault();
                        e.stopPropagation();

                        /* 思源协议 siyuan:// 需要使用单独的方案 */
                        if (meta.href.startsWith("siyuan://")) {
                            if (this.config.window.siyuan.enable) {
                                /* 打开思源编辑器 */
                                const url = buildSiyuanWebURL(
                                    editorType2Pathname(this.config.window.siyuan.editorType),
                                    parseSiyuanURL(new URL(meta.href))!,
                                );
                                this.openSiyuanWindow(url, e);
                            }
                        }
                        else {
                            this.openWindow(meta.href, {
                                x: e.screenX,
                                y: e.screenY,
                                title: meta.title || this.name,
                            });
                        }
                    }
                }
            }
            else { // 不为超链接
                /* 打开思源编辑器 */
                if (this.config.window.siyuan.enable) {
                    const block_id = getBlockID(e);
                    if (block_id) {
                        e.preventDefault();
                        e.stopPropagation();

                        const url = buildSiyuanWebURL(
                            editorType2Pathname(this.config.window.siyuan.editorType),
                            {
                                id: block_id,
                                focus: this.config.window.siyuan.focus,
                            },
                        );
                        this.openSiyuanWindow(url, e);
                    }
                }
            }
        }
        catch (e) {
            this.logger.warn(e);
        }
    };
};

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
import { getEditors } from "@workspace/utils/siyuan/model";
import { deshake } from "@workspace/utils/misc/deshake";
import {
    getCurrentBlock,
    getCurrentProtyleContent,
} from "@workspace/utils/siyuan/dom";

import type {
    IClickEditorContentEvent,
    ILoadedProtyleEvent,
    IDestroyProtyleEvent,
} from "@workspace/types/siyuan/events";
import type { IProtyle } from "siyuan/types/protyle";

import { DEFAULT_CONFIG } from "./configs/default";
import type { I18N } from "./utils/i18n";
import type { IConfig } from "./types/config";

declare var globalThis: ISiyuanGlobal;

export default class TypewriterPlugin extends siyuan.Plugin {
    static readonly GLOBAL_CONFIG_NAME = "global-config";

    declare public readonly i18n: I18N;

    public readonly siyuan = siyuan;
    public readonly logger: InstanceType<typeof Logger>;
    public readonly client: InstanceType<typeof Client>;

    protected readonly SETTINGS_DIALOG_ID: string;
    protected readonly protyles = new WeakSet<IProtyle>();

    protected config: IConfig = DEFAULT_CONFIG;
    protected scrollIntoView!: ReturnType<typeof deshake<(element: HTMLElement) => void>>;
    protected scrollBy!: ReturnType<typeof deshake<(element: HTMLElement, options: ScrollToOptions) => void>>;
    protected currentElement?: Element; // 当前元素
    protected topBarButton?: HTMLElement; // 顶部菜单栏按钮

    constructor(options: any) {
        super(options);

        this.logger = new Logger(this.name);
        this.client = new Client(undefined, "fetch");

        this.SETTINGS_DIALOG_ID = `${this.name}-settings-dialog`;
        this.updateScrollFunction();
    }

    onload(): void {
        // this.logger.debug(this);

        /* 注册图标 */
        this.addIcons([
        ].join(""));

        /**
         * 注册快捷键命令
         * 在 onload 结束后即刻解析, 因此不能在回调函数中注册
         */
        this.addCommand({ // 打开/关闭打字机模式
            langKey: "toggle-typewriter",
            langText: this.i18n.menu.switch.command.text,
            hotkey: "⌥⇧T", // 默认快捷键 Ctrl + Enter
            customHotkey: "⌥⇧T", // 自定义快捷键
            callback: this.toggleEnableState,
        });

        this.loadData(TypewriterPlugin.GLOBAL_CONFIG_NAME)
            .then(config => {
                this.config = mergeIgnoreArray(DEFAULT_CONFIG, config || {}) as IConfig;
                this.updateScrollFunction();
            })
            .catch(error => this.logger.error(error))
            .finally(() => {
                this.activate(this.config.typewriter.enable);
            });
    }

    onLayoutReady(): void {
        this.topBarButton = this.addTopBar({
            icon: "iconKeymap",
            title: this.i18n.menu.switch.title,
            position: "right",
            callback: this.toggleEnableState,
        });
    }

    onunload(): void {
        this.activate(false);
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

        this.activate(this.config.typewriter.enable);
        this.updateScrollFunction();

        return this.saveData(TypewriterPlugin.GLOBAL_CONFIG_NAME, this.config);
    }

    /**
     * 切换监听器
     * @param protyle 编辑器
     * @param enable 是否启用打字机模式
     */
    protected toggleEventListener(
        protyle: IProtyle,
        enable: boolean,
    ): void {
        const listener = [
            "keyup",
            this.editorEventListener,
            {
                capture: true,
            },
        ] as Parameters<HTMLElement["addEventListener"]>;

        switch (true) {
            case enable && !this.protyles.has(protyle): // 未加入监听的编辑器
                this.protyles.add(protyle);
                protyle.wysiwyg?.element?.addEventListener(...listener);
                break;

            case !enable && this.protyles.has(protyle): // 已加入监听的编辑器
                this.protyles.delete(protyle);
                protyle.wysiwyg?.element?.removeEventListener(...listener);
                break;
        }
    }

    /**
     * 激活或禁用打字机模式
     * @param enable 是否启用打字机模式
     */
    protected activate(enable: boolean): void {
        const editors = getEditors(); // 获取所有编辑器
        for (const editor of editors) {
            const protyle = editor?.protyle;
            if (protyle) {
                this.toggleEventListener(protyle, enable);
            }
        }

        if (this.topBarButton) {
            /* 更改顶部菜单栏按钮文本 */
            this.topBarButton.ariaLabel = enable
                ? this.i18n.menu.switch.enabled
                : this.i18n.menu.switch.disabled;

            /* 更改顶部菜单栏按钮状态 */
            this.topBarButton.classList.toggle("toolbar__item--active", enable);
        }

        if (enable) {
            this.eventBus.on("loaded-protyle", this.loadedProtyleEventListener);
            this.eventBus.on("destroy-protyle", this.destroyProtyleEventListener);
            this.eventBus.on("click-editorcontent", this.clickEditorContentEventListener);
        }
        else {
            this.eventBus.off("loaded-protyle", this.loadedProtyleEventListener);
            this.eventBus.off("destroy-protyle", this.destroyProtyleEventListener);
            this.eventBus.off("click-editorcontent", this.clickEditorContentEventListener);
        }
    }

    /**
     * 更新滚动函数
     * @param timeout 延时 (ms)
     */
    protected updateScrollFunction(timeout: number = this.config.typewriter.timeout): void {
        this.scrollIntoView = deshake(
            (element: HTMLElement) => {
                // this.logger.debug(element);
                element.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "center",
                });
            },
            timeout,
        );
        this.scrollBy = deshake(
            (element: HTMLElement, options: ScrollToOptions) => {
                // this.logger.debug(options);
                element.scrollBy(options);
            },
            timeout,
        );
    }

    /**
     * 切换模式激活状态
     */
    protected readonly toggleEnableState = () => {
        this.config.typewriter.enable = !this.config.typewriter.enable;
        this.activate(this.config.typewriter.enable);
    };

    /* 编辑器加载事件 */
    protected readonly loadedProtyleEventListener = (e: ILoadedProtyleEvent) => {
        // this.logger.debug(e);

        /* 若开启打字机模式, 添加编辑事件监听器 */
        if (this.config.typewriter.enable) {
            const protyle = e.detail;
            this.toggleEventListener(protyle, true);
        }
    };

    /* 编辑器关闭事件 */
    protected readonly destroyProtyleEventListener = (e: IDestroyProtyleEvent) => {
        // this.logger.debug(e);

        /* 移除编辑事件监听器 */
        const protyle = e.detail.protyle;
        this.toggleEventListener(protyle, false);
    };

    /* 编辑器点击事件 */
    protected readonly clickEditorContentEventListener = (e: IClickEditorContentEvent) => {
        // this.logger.debug(e);

        /* 若开启打字机模式, 派发编辑事件 */
        if (this.config.typewriter.enable) {
            const event = e.detail.event;
            this.editorEventListener(event);
        }
    };

    /* 编辑事件监听 */
    protected readonly editorEventListener = (e: Event) => {
        // this.logger.debug(e);

        if (this.config.typewriter.enable) { // 已开启打字机模式
            const block = getCurrentBlock(); // 当前光标所在块
            if (block) {
                let element: HTMLElement | null = block;

                switch (block.dataset.type) {
                    case "NodeCodeBlock":
                        if (this.config.typewriter.code.row) { // 定位到行
                            const page = getCurrentProtyleContent(); // 当前页面
                            if (page) {
                                const selection = globalThis.getSelection();
                                const focusNode = selection?.focusNode;

                                if (focusNode) {
                                    let height = 0;
                                    let bottom = 0;

                                    switch (true) {
                                        case focusNode instanceof HTMLElement: // 元素为 HTML 元素
                                            element = focusNode as HTMLElement;
                                            break;
                                        case focusNode instanceof Text: // 元素为文本节点
                                            if (focusNode.parentElement?.localName === "span") { // 文本节点上层为 span-hljs
                                                element = focusNode.parentElement;
                                                break;
                                            }
                                            else if (focusNode.parentElement?.classList.contains("hljs")) { // 文本节点上层为 hljs
                                                switch (true) {
                                                    // @ts-ignore
                                                    case focusNode.previousElementSibling instanceof HTMLElement: // 文本节点前方存在 span-hljs 节点
                                                        // @ts-ignore
                                                        element = focusNode.previousElementSibling;
                                                        break;

                                                    // @ts-ignore
                                                    case focusNode.nextElementSibling instanceof HTMLElement: // 文本节点后方存在 span-hljs 节点
                                                        // @ts-ignore
                                                        element = focusNode.nextElementSibling;
                                                        break;

                                                    default: { // 文本节点前后均不存在 span-hljs 节点
                                                        const focusOffset = selection.focusOffset;
                                                        const textContent = focusNode.textContent; // 文本内容
                                                        const linenumber = textContent?.substring(0, focusOffset).split("\n").length ?? 0; // 行数

                                                        element = null;
                                                        height = parseFloat(globalThis.getComputedStyle(focusNode.parentElement).getPropertyValue("line-height")); // 代码块每一行高度
                                                        bottom = focusNode.parentElement.getBoundingClientRect().top + height * linenumber; // 当前行底部的坐标
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                        default:
                                            return;
                                    }

                                    const {
                                        height: page_height, // 当前页面的高度
                                        bottom: page_bottom,
                                    } = page.getBoundingClientRect();
                                    const {
                                        height: element_height, // 当前元素的高度
                                        bottom: element_bottom, // 当前元素的底部
                                    } = element
                                            ? element.getBoundingClientRect()
                                            : {
                                                height,
                                                bottom,
                                            };

                                    this.scrollBy(page, {
                                        top: -((page_bottom - page_height / 2) - (element_bottom - element_height / 2)),
                                        left: 0,
                                        behavior: "smooth",
                                    });
                                }
                            }
                            return;
                        }
                        break;
                    case "NodeTable":
                        if (this.config.typewriter.table.row) { // 定位到行
                            let focus = globalThis.getSelection()?.focusNode;
                            while (true) {
                                if (!focus) { // 元素不存在
                                    break;
                                }
                                else { // 元素存在
                                    if (focus instanceof HTMLElement) { // 元素为 HTML 元素
                                        if (focus.localName === "td" || focus.localName === "th") { // 元素为表格单元格
                                            break;
                                        }
                                    }
                                }
                                focus = focus.parentElement;
                            }
                            element = focus ?? block;
                        }
                        break;
                    default:
                        break;
                }

                if (this.currentElement === element) { // 当前元素未改变
                    return;
                }
                else { // 更新当前元素并滚动
                    this.currentElement = element;
                    this.scrollIntoView(element);
                }
            }
        }
    };
};

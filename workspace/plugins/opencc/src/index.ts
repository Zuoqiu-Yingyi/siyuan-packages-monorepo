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

import {
    range2HTML,
    replaceRangeWithHTML,
} from "@workspace/utils/dom/range";
import {
    FLAG_MOBILE,
} from "@workspace/utils/env/front-end";
import { Logger } from "@workspace/utils/logger";
import {
    copyText,
} from "@workspace/utils/misc/copy";
import { Enum } from "@workspace/utils/misc/enum";
import { mergeIgnoreArray } from "@workspace/utils/misc/merge";
import {
    isLeafNode,
} from "@workspace/utils/siyuan/block";
import {
    updateBlockID,
} from "@workspace/utils/siyuan/dom";
import {
    getBlockMenuContext,
    getSelectedMenuContext,
    type IBlockMenuContext,
    type ISelectedMenuContext,
} from "@workspace/utils/siyuan/menu/block";
import { fn__code } from "@workspace/utils/siyuan/text/span";

import icon_opencc_convert from "./assets/symbols/icon-opencc-convert.symbol?raw";
import Settings from "./components/Settings.svelte";
import {
    DEFAULT_CONFIG,
    DEFAULT_CUSTOM_DICTS,
} from "./configs/default";
import { convert, createConverter, Locale, type IConverterOptions } from "./opencc";
import { locale2lang } from "./opencc/lang";

import type {
    IClickBlockIconEvent,
    IClickEditorTitleIconEvent,
    IOpenMenuContentEvent,
} from "@workspace/types/siyuan/events";
import type { IProtyle } from "@workspace/types/siyuan/protyle";

import type { IConfig } from "./types/config";
import type { IDict, IDicts } from "./types/dictionary";
import type { I18N } from "./utils/i18n";

export default class OpenCCPlugin extends siyuan.Plugin {
    static readonly GLOBAL_CONFIG_NAME = "global-config";

    declare public readonly i18n: I18N;

    public readonly siyuan = siyuan;
    public readonly logger: InstanceType<typeof Logger>;
    public readonly client: InstanceType<typeof Client>;

    protected readonly SETTINGS_DIALOG_ID: string;

    protected config: IConfig = DEFAULT_CONFIG;

    protected readonly dicts: IDicts = DEFAULT_CUSTOM_DICTS;

    constructor(options: any) {
        super(options);

        this.logger = new Logger(this.name);
        this.client = new Client(undefined, "fetch");

        this.SETTINGS_DIALOG_ID = `${this.name}-settings-dialog`;
    }

    public override onload(): void {
        // this.logger.debug(this);

        /* 注册图标 */
        this.addIcons([
            icon_opencc_convert,
        ].join(""));

        this.loadData(OpenCCPlugin.GLOBAL_CONFIG_NAME)
            .then((config) => {
                this.config = mergeIgnoreArray(DEFAULT_CONFIG, config || {}) as IConfig;
            })
            .catch((error) => this.logger.error(error))
            .finally(() => {
                /* 划选文本菜单 */
                this.eventBus.on("open-menu-content", this.openMenuContentEventListener);
                /* 非文档块菜单 */
                this.eventBus.on("click-blockicon", this.blockMenuEventListener);
                /* 文档块菜单 */
                this.eventBus.on("click-editortitleicon", this.blockMenuEventListener);
            });
    }

    public override onLayoutReady(): void {
    }

    public override onunload(): void {
        this.eventBus.off("open-menu-content", this.openMenuContentEventListener);
    }

    public override openSetting(): void {
        const dialog = new siyuan.Dialog({
            title: `${this.i18n.displayName} <code class="fn__code">${this.name}</code>`,
            content: `<div id="${this.SETTINGS_DIALOG_ID}" class="fn__flex-column" />`,
            width: FLAG_MOBILE ? "92vw" : "720px",
            height: FLAG_MOBILE ? undefined : "640px",
        });
        const target = dialog.element.querySelector(`#${this.SETTINGS_DIALOG_ID}`);
        if (target) {
            const settings = new Settings({
                target,
                props: {
                    config: this.config,
                    plugin: this,
                },
            });
            void settings;
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
        return this.saveData(OpenCCPlugin.GLOBAL_CONFIG_NAME, this.config);
    }

    /* 更新字典 */
    protected updateDicts(): void {
        this.updateDict(
            this.config.opencc.dict,
            this.dicts.global,
        );
        this.updateDict(
            this.config.opencc.s2t.dict,
            this.dicts.s2t,
        );
        this.updateDict(
            this.config.opencc.t2s.dict,
            this.dicts.t2s,
        );
        this.updateDict(
            this.config.opencc.custom.dict,
            this.dicts.custom,
        );
    }

    /**
     * 更新字典
     * @param str - 字典字符串, 每个映射使用 `|` 或 `\n` 分隔 @example `foo1 bar1|foo2 bar2\nfoo3 bar3|foo4 bar4`
     * @param dict - 字典对象
     * @returns 是否更新成功
     */
    protected updateDict(str: string, dict: IDict): boolean {
        if (str !== dict.str) {
            const map = new Map<string, string>();
            str.trim().split("\n").forEach((line) => {
                line.trim().split("|").forEach((field) => {
                    const tuple = field.trim().split(/\s+/);
                    if (tuple.length === 2) {
                        map.set(tuple[0]!, tuple[1]!);
                    }
                });
            });

            dict.str = str;
            dict.dict = Array.from(map);
            return true;
        }
        return false;
    }

    /* 划选文本菜单事件监听器 */
    protected readonly openMenuContentEventListener = (e: IOpenMenuContentEvent) => {
        // this.logger.debug(e);

        const detail = e.detail;
        const context = getSelectedMenuContext(detail);
        if (context) {
            this.buildMenu(
                detail.menu,
                context,
                detail.protyle,
            );
        }
    };

    /* 块菜单菜单弹出事件监听器 */
    protected readonly blockMenuEventListener = (e: IClickBlockIconEvent | IClickEditorTitleIconEvent) => {
        // this.logger.debug(e);

        const detail = e.detail;
        const context = getBlockMenuContext(detail); // 获取块菜单上下文
        if (context) {
            this.buildMenu(
                detail.menu,
                context,
                detail.protyle,
            );
        }
    };

    /**
     * 构造菜单
     * @param menu - 菜单对象
     * @param context - 菜单上下文
     * @param protyle - 当前使用的 Protyle
     */
    protected buildMenu(
        menu: siyuan.EventMenu,
        context: IBlockMenuContext | ISelectedMenuContext,
        protyle: IProtyle,
    ): void {
        const submenu: siyuan.IMenuItemOption[] = [];

        // 简体 => 繁体
        submenu.push({
            submenu: this.buildSubmenu(
                context,
                protyle,
                {
                    from: this.config.opencc.s2t.from,
                    to: this.config.opencc.s2t.to,
                    dict: [
                        this.dicts.global.dict,
                        this.dicts.s2t.dict,
                    ],
                },
            ),
            icon: "icon-opencc-convert",
            label: this.i18n.menu.s2t.label,
            accelerator: `${fn__code(locale2lang(this.config.opencc.s2t.from))} → ${fn__code(locale2lang(this.config.opencc.s2t.to))}`,
        });

        // 繁体 => 简体
        submenu.push({
            submenu: this.buildSubmenu(
                context,
                protyle,
                {
                    from: this.config.opencc.t2s.from,
                    to: this.config.opencc.t2s.to,
                    dict: [
                        this.dicts.global.dict,
                        this.dicts.t2s.dict,
                    ],
                },
            ),
            icon: "icon-opencc-convert",
            label: this.i18n.menu.t2s.label,
            accelerator: `${fn__code(locale2lang(this.config.opencc.t2s.from))} → ${fn__code(locale2lang(this.config.opencc.t2s.to))}`,
        });

        // 自定义转换
        submenu.push({
            submenu: this.buildSubmenu(
                context,
                protyle,
                {
                    from: this.config.opencc.custom.from,
                    to: this.config.opencc.custom.to,
                    dict: [
                        this.dicts.global.dict,
                        this.dicts.custom.dict,
                    ],
                },
            ),
            icon: "icon-opencc-convert",
            label: this.i18n.menu.custom.label,
            accelerator: `${fn__code(locale2lang(this.config.opencc.custom.from))} → ${fn__code(locale2lang(this.config.opencc.custom.to))}`,
        });

        // 其他转换
        const submenu1: siyuan.IMenuItemOption[] = [];
        for (const from of Enum.values(Locale)) {
            const submenu2: siyuan.IMenuItemOption[] = [];

            for (const to of Enum.values(Locale)) {
                const disabled = from === to;
                submenu2.push({
                    submenu: this.buildSubmenu(
                        context,
                        protyle,
                        {
                            from,
                            to,
                            dict: [
                                this.dicts.global.dict,
                            ],
                        },
                        disabled,
                    ),
                    icon: "iconFont",
                    label: this.i18n.locale[to],
                    accelerator: fn__code(locale2lang(to)),
                    disabled,
                });
            }

            submenu1.push({
                submenu: submenu2,
                icon: "iconFont",
                label: this.i18n.locale[from],
                accelerator: fn__code(locale2lang(from)),
            });
        }
        submenu.push({
            submenu: submenu1,
            icon: "icon-opencc-convert",
            label: this.i18n.menu.other.label,
        });

        menu.addItem({
            submenu,
            icon: "icon-opencc-convert",
            label: this.i18n.displayName,
            accelerator: this.name,
        });
    }

    /**
     * 构造次级菜单
     * @param context - 菜单上下文
     * @param protyle - 当前使用的 Protyle
     * @param options - 转换配置
     * @param disabled - 是否禁用
     * @returns 次级菜单
     */
    protected buildSubmenu(
        context: IBlockMenuContext | ISelectedMenuContext,
        protyle: IProtyle,
        options: IConverterOptions,
        disabled: boolean = false,
    ): siyuan.IMenuItemOption[] {
        const submenu: siyuan.IMenuItemOption[] = [];

        const flag_select = ("range" in context);
        const flag_block = ("isDocumentBlock" in context);
        const flag_document = flag_block && context.isDocumentBlock;

        /* 复制转换结果 */
        const copy = async (type: "kramdown" | "markdown" | "plaintext") => {
            const html = await this.getSelectedHTML(context, false);
            const result = (() => {
                switch (type) {
                    case "plaintext":
                        return protyle.lute!.BlockDOM2Content(html);
                    case "markdown":
                        return protyle.lute!.BlockDOM2StdMd(html);
                    case "kramdown":
                        return protyle.lute!.BlockDOM2StdMd(html);
                    default:
                        return null;
                }
            })();

            if (result) {
                copyText(convert(result, options));
                this.siyuan.showMessage(this.i18n.messages.copy.success);
                return true;
            }
            else {
                return false;
            }
        };

        /* 插入整个转换结果 */
        const insertWhole = async (type: "after" | "before") => {
            const html = await this.getSelectedHTML(context, false);
            const result = convert(updateBlockID(html), options);
            return this.insertSelectedHTML(
                context,
                result,
                type,
            );
        };

        /* 插入每个叶子块的转换结果 */
        const insertParts = async (type: "after" | "before") => {
            const html = await this.getSelectedHTML(context, false);
            const element = document.createElement("div");
            element.innerHTML = html;
            const leaves = Array
                .from(element.querySelectorAll<HTMLDivElement>("div[data-node-id]"))
                .filter(isLeafNode);
            const converter = createConverter(options);

            /* 依次插入, 避免块位置错位 */
            for (const leaf of leaves) {
                const data = converter(updateBlockID(leaf.outerHTML));
                switch (type) {
                    case "before":
                        await this.client.insertBlock({
                            nextID: leaf.dataset.nodeId,
                            data,
                            dataType: "dom",
                        });
                        break;
                    case "after":
                        await this.client.insertBlock({
                            previousID: leaf.dataset.nodeId,
                            data,
                            dataType: "dom",
                        });
                        break;
                    default:
                        break;
                }
            }
            return true;
        };

        /* 复制转换结果 (纯文本) */
        submenu.push({
            icon: "iconCopy",
            label: this.i18n.menu.copyResult.label,
            accelerator: this.i18n.menu.copyResult.accelerator.plaintext,
            click: async () => {
                await copy("plaintext");
            },
            disabled,
        });

        /* 复制转换结果 (Markdown) */
        submenu.push({
            icon: "iconCopy",
            label: this.i18n.menu.copyResult.label,
            accelerator: "Markdown",
            click: async () => {
                await copy("markdown");
            },
            disabled,
        });

        /* 复制转换结果 (kramdown) */
        submenu.push({
            icon: "iconCopy",
            label: this.i18n.menu.copyResult.label,
            accelerator: "kramdown",
            click: async () => {
                await copy("kramdown");
            },
            disabled,
        });

        submenu.push({ type: "separator" });

        /* 在上方插入转换结果 */
        submenu.push({
            icon: "iconBefore",
            label: this.i18n.menu.insertBefore.label,
            click: async () => {
                await insertWhole("before");
            },
            disabled,
        });

        /* 在每个块的上方插入转换结果 */
        submenu.push({
            icon: "iconBefore",
            label: this.i18n.menu.insertBeforeEachBlock.label,
            click: async () => {
                await insertParts("before");
            },
            disabled: disabled || flag_select,
        });

        /* 转换结果替换原内容 */
        submenu.push({
            icon: "iconReplace",
            label: this.i18n.menu.replaceOriginalText.label,
            click: async () => {
                const htmls = await this.getSelectedHTML(context, true);
                const converter = createConverter(options);
                const results = htmls.map(converter);
                this.updateSelectedHTML(context, results);
            },
            disabled,
        });

        /* 在每个块的下方插入转换结果 */
        submenu.push({
            icon: "iconAfter",
            label: this.i18n.menu.insertAfterEachBlock.label,
            click: async () => {
                await insertParts("after");
            },
            disabled: disabled || flag_select,
        });

        /* 在下方插入转换结果 */
        submenu.push({
            icon: "iconAfter",
            label: this.i18n.menu.insertAfter.label,
            click: async () => {
                await insertWhole("after");
            },
            disabled,
        });

        submenu.push({ type: "separator" });

        /* 转换文档标题 */
        submenu.push({
            icon: "iconCopy",
            label: this.i18n.menu.renameDocumentTitle.label,
            click: async () => {
                const title = (protyle.title!.editElement as HTMLDivElement).textContent;
                const result = convert(title!, options);
                this.client.renameDoc({
                    notebook: protyle.notebookId!,
                    path: protyle.path!,
                    title: result,
                });
            },
            disabled: disabled || !flag_document,
        });

        return submenu;
    }

    /**
     * 获取选中内容的 HTML
     * @param context - 上下文
     * @param split - 是否分割多个块
     * @returns HTML/HTMLs
     */
    protected async getSelectedHTML(
        context: IBlockMenuContext | ISelectedMenuContext,
        split: false,
    ): Promise<string>;
    protected async getSelectedHTML(
        context: IBlockMenuContext | ISelectedMenuContext,
        split: true,
    ): Promise<string[]>;
    protected async getSelectedHTML(
        context: IBlockMenuContext | ISelectedMenuContext,
        split: boolean = false,
    ): Promise<string | string[]> {
        let html: string;
        if ("range" in context) { // 划选行内文本
            html = range2HTML(context.range);
        }
        else if (context.isDocumentBlock) { // 文档块
            const response = await this.client.getDoc({ id: context.id });
            html = response.data.content;
        }
        else { // 非文档块
            const htmls: string[] = [];
            for (const block of context.blocks) {
                htmls.push(block.element.outerHTML);
            }
            if (split)
                return htmls;
            else return htmls.join("");
        }
        if (split)
            return [html];
        else return html;
    }

    /**
     * 更新选中内容的 HTML
     * @param context - 上下文
     * @param htmls - HTML
     * @returns 是否更新成功
     */
    protected async updateSelectedHTML(
        context: IBlockMenuContext | ISelectedMenuContext,
        htmls: string | string[],
    ): Promise<boolean> {
        let html: string | undefined;
        if (Array.isArray(htmls) && htmls.length === 1) {
            html = htmls[0]!;
        }
        else if (typeof htmls === "string") {
            html = htmls as string;
        }

        if ("range" in context) { // 划选行内文本
            if (html) {
                replaceRangeWithHTML(context.range, html);
                return true;
            }
        }
        else if (context.isDocumentBlock) { // 文档块
            if (html) {
                await this.client.updateBlock({
                    id: context.id,
                    data: html,
                    dataType: "dom",
                });
                return true;
            }
        }
        else { // 非文档块
            if (!context.isMultiBlock && html) {
                await this.client.updateBlock({
                    id: context.id,
                    data: html,
                    dataType: "dom",
                });
                return true;
            }
            else if (Array.isArray(htmls) && context.blocks.length === htmls.length) {
                await Promise.all(context.blocks.map((block, index) => this.client.updateBlock({
                    id: block.id,
                    data: htmls[index]!,
                    dataType: "dom",
                })));
                return true;
            }
        }
        return false;
    }

    /**
     * 插入选中内容的 HTML
     * @param context - 上下文
     * @param html - HTML
     * @param position - 插入位置
     * @returns 是否插入成功
     */
    protected async insertSelectedHTML(
        context: IBlockMenuContext | ISelectedMenuContext,
        html: string,
        position: "after" | "before",
    ): Promise<boolean> {
        if ("range" in context) { // 划选行内文本
            switch (position) {
                case "before": // 插入至当前块的上方
                    await this.client.insertBlock({
                        nextID: context.block.id,
                        data: html,
                        dataType: "dom",
                    });
                    return true;
                case "after": // 插入至当前块的下方
                    await this.client.insertBlock({
                        previousID: context.block.id,
                        data: html,
                        dataType: "dom",
                    });
                    return true;
                default:
                    return false;
            }
        }
        else if (context.isDocumentBlock) { // 文档块
            switch (position) {
                case "before": // 插入至文档首
                    await this.client.prependBlock({
                        parentID: context.id,
                        data: html,
                        dataType: "dom",
                    });
                    return true;
                case "after": // 插入至文档尾
                    await this.client.appendBlock({
                        parentID: context.id,
                        data: html,
                        dataType: "dom",
                    });
                    return true;
                default:
                    return false;
            }
        }
        else { // 非文档块
            switch (position) {
                case "before": // 插入至第一个块的上方
                    await this.client.insertBlock({
                        nextID: context.blocks.at(0)!.id,
                        data: html,
                        dataType: "dom",
                    });
                    return true;
                case "after": // 插入最后一个块的下方
                    await this.client.insertBlock({
                        previousID: context.blocks.at(-1)!.id,
                        data: html,
                        dataType: "dom",
                    });
                    return true;
                default:
                    return false;
            }
        }
    }
};

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

import "@xterm/xterm/css/xterm.css";

import { FitAddon } from "@xterm/addon-fit";
import {
    Terminal,
    type ITheme,
} from "@xterm/xterm";

import { decode } from "@workspace/utils/misc/base64";
import { copyText } from "@workspace/utils/misc/copy";
import { deshake } from "@workspace/utils/misc/deshake";
import { isMatchedKeyboardEvent } from "@workspace/utils/shortcut/match";
import { isLightTheme } from "@workspace/utils/siyuan/theme";

import manifest from "~/public/plugin.json";

import type JupyterClientPlugin from "@/index";

export type TObservedAttributes = "data-stream";

/**
 * REF: https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components
 */
export class XtermOutputElement extends HTMLElement {
    static plugin: InstanceType<typeof JupyterClientPlugin>;

    /**
     * REF: https://github.com/mdn/web-components-examples/blob/main/life-cycle-callbacks/main.js
     * 
     * Specify observed attributes so that {@link XtermOutputElement.attributeChangedCallback | attributeChangedCallback} will work
     */
    static get observedAttributes(): TObservedAttributes[] {
        return [
            "data-stream",
        ];
    }

    public static readonly TAG_NAME = "jupyter-xterm-output";
    protected static readonly ELEMENT_ID_STYLE = "style";
    protected static readonly ELEMENT_ID_CONTENT = "content";
    protected static readonly ELEMENT_ID_PREVIEW = "preview";

    protected readonly save?: string; // 是否保存渲染结果
    protected readonly blockId?: string; // 块 ID
    protected readonly linkHref: string; // 样式表引用地址
    public override readonly shadowRoot: ShadowRoot; // 样式表引用地址

    protected link?: HTMLLinkElement | null; // 样式表引用标签
    protected content?: HTMLPreElement | null; // 存放输出流文本的标签 (data-stream 保存 base 64 编码的数据)
    protected preview?: HTMLDivElement | null; // 存放渲染结果的标签

    protected data: string = ""; // 输出流的原始内容
    protected _terminal?: InstanceType<typeof Terminal>; // xterm 终端实例
    protected fitAddon?: InstanceType<typeof FitAddon>; // xterm 终端实例
    protected resizeObserver?: InstanceType<typeof ResizeObserver>; // xterm 终端实例

    public get fontSize(): number | undefined {
        return Number.parseFloat(globalThis.getComputedStyle(this).getPropertyValue("font-size"))
            || window.siyuan?.config?.editor?.fontSize;
    }

    public get terminal(): InstanceType<typeof Terminal> | undefined {
        return this._terminal;
    }

    constructor() {
        super();
        this.save = this.dataset.save;
        this.blockId = this.dataset.blockId;
        this.linkHref = `plugins/${XtermOutputElement.plugin.name}/index.css?v=${manifest.version}`;

        this.shadowRoot = this.attachShadow({ mode: "open" });
    }

    /**
     * 当 custom element 首次被插入文档 DOM 时调用
     * REF: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#using_the_lifecycle_callbacks
     */
    connectedCallback(): void {
        XtermOutputElement.plugin.xtermElements.add(this);
        this.link = this.querySelector(`link#${XtermOutputElement.ELEMENT_ID_STYLE}`);
        this.content = this.querySelector(`pre#${XtermOutputElement.ELEMENT_ID_CONTENT}`);
        this.preview = this.querySelector(`div#${XtermOutputElement.ELEMENT_ID_PREVIEW}`);

        if (!this.link) { // 无样式表
            this.link = document.createElement("link");
            this.link.id = XtermOutputElement.ELEMENT_ID_STYLE;
            this.link.rel = "stylesheet";
            this.link.href = this.linkHref;

            this.shadowRoot.appendChild(this.link);
        }

        if (this.dataset.stream !== undefined) { // 存在数据流内容 (该组件的属性)
            this.data = decode(this.dataset.stream);
        }
        else if (this.content) { // 存在输出流的内容 (pre 元素属性)
            this.shadowRoot.appendChild(this.content);
            this.content.style.display = "none"; // 隐藏文本内容

            this.data = decode(this.content.dataset.stream ?? "");
        }

        if (this.preview) { // 已渲染
            this.shadowRoot.appendChild(this.preview);
        }
        else { // 未渲染
            this.preview = document.createElement("div");
            this.preview.id = XtermOutputElement.ELEMENT_ID_PREVIEW;
            this.sizeObserver(this.preview);

            this.shadowRoot.appendChild(this.preview);
            const theme = isLightTheme()
                // eslint-disable-next-line ts/no-use-before-define
                ? light_theme
                // eslint-disable-next-line ts/no-use-before-define
                : dark_theme;

            this._terminal = new Terminal({
                rows: 0,
                theme,
                fontSize: this.fontSize,
                ...XtermOutputElement.plugin.config.xterm.options,
            });
            this.fitAddon = new FitAddon();

            this._terminal.loadAddon(this.fitAddon);
            this._terminal.loadAddon(this.customAddon);

            this._terminal.open(this.preview);
            this._terminal.write(this.data, this.fit);
        }
    }

    protected async write(data: Parameters<Terminal["write"]>[0]): Promise<void> {
        return new Promise((resolve) => {
            this._terminal?.write(data, resolve);
        });
    }

    protected async writeln(data: Parameters<Terminal["writeln"]>[0]): Promise<void> {
        return new Promise((resolve) => {
            this._terminal?.writeln(data, resolve);
        });
    }

    protected readonly customAddon = {
        activate: (terminal: Terminal) => {
            // TODO: 注册一个渲染完成后保存功能
            // if (this.save && this.blockId) {
            //     XtermOutputElement.plugin.client.updateBlock({
            //         id: this.blockId,
            //         data: `<div>\n${this.outerHTML}\n</div>`,
            //         dataType: "markdown",
            //     });
            // }

            /* 注册复制功能 */
            terminal.attachCustomKeyEventHandler((e) => {
                // XtermOutputElement.plugin.logger.debug(e);

                if (
                    isMatchedKeyboardEvent(e, {
                        type: "keydown",
                        key: "c",
                        ctrlKey: true,
                        metaKey: false,
                        altKey: false,
                        shiftKey: false,
                    })
                    || isMatchedKeyboardEvent(e, {
                        type: "keydown",
                        key: "c",
                        ctrlKey: false,
                        metaKey: true,
                        altKey: false,
                        shiftKey: false,
                    })
                ) {
                    const selection = terminal.getSelection();
                    copyText(selection);
                    return false;
                }
                return true;
            });
        },
        dispose() { },
        fit: () => {
            // XtermOutputElement.plugin.logger.debug(this._terminal.buffer);
            this._terminal?.resize(
                this._terminal.cols,
                this._terminal.buffer.active.baseY
                + this._terminal.buffer.active.cursorY
                + 1,
            );
        },
    };

    protected readonly fit = () => {
        try {
            if (this._terminal) {
                if (this._terminal.options.fontSize !== this.fontSize)
                    this._terminal.options.fontSize = this.fontSize;
            }

            // ! 错误无法被捕获
            this.fitAddon?.fit();
            this.customAddon?.fit();
        }
        catch (error) {
            XtermOutputElement.plugin.logger.warn(error);
        }
    };

    protected sizeObserver(element: HTMLElement): void {
        /**
         * 监听元素尺寸变化
         * REF: https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver
         */
        this.resizeObserver ??= new ResizeObserver(
            deshake( // 消除抖动
                this.fit,
                125,
            ),
        );
        this.resizeObserver.observe(
            element,
            {
                box: "content-box",
            },
        );
    }

    /**
     * 当 custom element 从文档 DOM 中删除时调用
     */
    disconnectedCallback(): void {
        XtermOutputElement.plugin.xtermElements.delete(this);
        this.resizeObserver?.disconnect();
        this._terminal?.dispose();
    }

    /**
     * 当 custom element 被移动到新的文档时调用
     */
    adoptedCallback(): void {

    }

    /**
     * 当 custom element 增加、删除、修改自身属性时调用
     * 
     * 需要设置 {@link XtermOutputElement.observedAttributes | observedAttributes}
     */
    async attributeChangedCallback(
        name: TObservedAttributes,
        _oldValue: string,
        newValue: string,
    ): Promise<void> {
        // XtermOutputElement.plugin.logger.debug(arguments);

        switch (name) {
            case "data-stream":
                if (this._terminal) {
                    this.data = decode(newValue);

                    await this.write("\n");
                    this._terminal.clear();
                    this._terminal.write(this.data, this.fit);
                }
                break;

            default:
                break;
        }
    }
}

export const share_theme: ITheme = {
    background: "#0000",

    /** ANSI extended colors (16-255) */
    extendedAnsi: [
        "#000000",
        "#00005f",
        "#000087",
        "#0000af",
        "#0000d7",
        "#0000ff",
        "#005f00",
        "#005f5f",
        "#005f87",
        "#005faf",
        "#005fd7",
        "#005fff",
        "#008700",
        "#00875f",
        "#008787",
        "#0087af",
        "#0087d7",
        "#0087ff",
        "#00af00",
        "#00af5f",
        "#00af87",
        "#00afaf",
        "#00afd7",
        "#00afff",
        "#00d700",
        "#00d75f",
        "#00d787",
        "#00d7af",
        "#00d7d7",
        "#00d7ff",
        "#00ff00",
        "#00ff5f",
        "#00ff87",
        "#00ffaf",
        "#00ffd7",
        "#00ffff",
        "#5f0000",
        "#5f005f",
        "#5f0087",
        "#5f00af",
        "#5f00d7",
        "#5f00ff",
        "#5f5f00",
        "#5f5f5f",
        "#5f5f87",
        "#5f5faf",
        "#5f5fd7",
        "#5f5fff",
        "#5f8700",
        "#5f875f",
        "#5f8787",
        "#5f87af",
        "#5f87d7",
        "#5f87ff",
        "#5faf00",
        "#5faf5f",
        "#5faf87",
        "#5fafaf",
        "#5fafd7",
        "#5fafff",
        "#5fd700",
        "#5fd75f",
        "#5fd787",
        "#5fd7af",
        "#5fd7d7",
        "#5fd7ff",
        "#5fff00",
        "#5fff5f",
        "#5fff87",
        "#5fffaf",
        "#5fffd7",
        "#5fffff",
        "#870000",
        "#87005f",
        "#870087",
        "#8700af",
        "#8700d7",
        "#8700ff",
        "#875f00",
        "#875f5f",
        "#875f87",
        "#875faf",
        "#875fd7",
        "#875fff",
        "#878700",
        "#87875f",
        "#878787",
        "#8787af",
        "#8787d7",
        "#8787ff",
        "#87af00",
        "#87af5f",
        "#87af87",
        "#87afaf",
        "#87afd7",
        "#87afff",
        "#87d700",
        "#87d75f",
        "#87d787",
        "#87d7af",
        "#87d7d7",
        "#87d7ff",
        "#87ff00",
        "#87ff5f",
        "#87ff87",
        "#87ffaf",
        "#87ffd7",
        "#87ffff",
        "#af0000",
        "#af005f",
        "#af0087",
        "#af00af",
        "#af00d7",
        "#af00ff",
        "#af5f00",
        "#af5f5f",
        "#af5f87",
        "#af5faf",
        "#af5fd7",
        "#af5fff",
        "#af8700",
        "#af875f",
        "#af8787",
        "#af87af",
        "#af87d7",
        "#af87ff",
        "#afaf00",
        "#afaf5f",
        "#afaf87",
        "#afafaf",
        "#afafd7",
        "#afafff",
        "#afd700",
        "#afd75f",
        "#afd787",
        "#afd7af",
        "#afd7d7",
        "#afd7ff",
        "#afff00",
        "#afff5f",
        "#afff87",
        "#afffaf",
        "#afffd7",
        "#afffff",
        "#d70000",
        "#d7005f",
        "#d70087",
        "#d700af",
        "#d700d7",
        "#d700ff",
        "#d75f00",
        "#d75f5f",
        "#d75f87",
        "#d75faf",
        "#d75fd7",
        "#d75fff",
        "#d78700",
        "#d7875f",
        "#d78787",
        "#d787af",
        "#d787d7",
        "#d787ff",
        "#d7af00",
        "#d7af5f",
        "#d7af87",
        "#d7afaf",
        "#d7afd7",
        "#d7afff",
        "#d7d700",
        "#d7d75f",
        "#d7d787",
        "#d7d7af",
        "#d7d7d7",
        "#d7d7ff",
        "#d7ff00",
        "#d7ff5f",
        "#d7ff87",
        "#d7ffaf",
        "#d7ffd7",
        "#d7ffff",
        "#ff0000",
        "#ff005f",
        "#ff0087",
        "#ff00af",
        "#ff00d7",
        "#ff00ff",
        "#ff5f00",
        "#ff5f5f",
        "#ff5f87",
        "#ff5faf",
        "#ff5fd7",
        "#ff5fff",
        "#ff8700",
        "#ff875f",
        "#ff8787",
        "#ff87af",
        "#ff87d7",
        "#ff87ff",
        "#ffaf00",
        "#ffaf5f",
        "#ffaf87",
        "#ffafaf",
        "#ffafd7",
        "#ffafff",
        "#ffd700",
        "#ffd75f",
        "#ffd787",
        "#ffd7af",
        "#ffd7d7",
        "#ffd7ff",
        "#ffff00",
        "#ffff5f",
        "#ffff87",
        "#ffffaf",
        "#ffffd7",
        "#ffffff",
        "#080808",
        "#121212",
        "#1c1c1c",
        "#262626",
        "#303030",
        "#3a3a3a",
        "#444444",
        "#4e4e4e",
        "#585858",
        "#626262",
        "#6c6c6c",
        "#767676",
        "#808080",
        "#8a8a8a",
        "#949494",
        "#9e9e9e",
        "#a8a8a8",
        "#b2b2b2",
        "#bcbcbc",
        "#c6c6c6",
        "#d0d0d0",
        "#dadada",
        "#e4e4e4",
        "#eeeeee",
    ],
} as const;

export const light_theme: ITheme = {
    foreground: "#3e424d",

    selectionBackground: "#fffe",
    selectionInactiveBackground: "#fffe",

    black: "#282c36",
    red: "#b22b31",
    green: "#007427",
    yellow: "#b27d12",
    blue: "#0065ca",
    magenta: "#a03196",
    cyan: "#258f8f",
    white: "#a1a6b2",

    brightBlack: "#3e424d",
    brightRed: "#e75c58",
    brightGreen: "#00a250",
    brightYellow: "#ddb62b",
    brightBlue: "#208ffb",
    brightMagenta: "#d160c4",
    brightCyan: "#60c6c8",
    brightWhite: "#c5c1b4",

    ...share_theme,
} as const;

export const dark_theme: ITheme = {
    foreground: "#a1a6b2",

    selectionBackground: "#fff3",
    selectionInactiveBackground: "#fff3",

    black: "#3e424d",
    red: "#e75c58",
    green: "#00a250",
    yellow: "#ddb62b",
    blue: "#208ffb",
    magenta: "#d160c4",
    cyan: "#60c6c8",
    white: "#c5c1b4",

    brightBlack: "#282c36",
    brightRed: "#b22b31",
    brightGreen: "#007427",
    brightYellow: "#b27d12",
    brightBlue: "#0065ca",
    brightMagenta: "#a03196",
    brightCyan: "#258f8f",
    brightWhite: "#a1a6b2",

    ...share_theme,
} as const;

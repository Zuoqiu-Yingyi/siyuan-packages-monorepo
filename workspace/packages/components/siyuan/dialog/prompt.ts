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

import Prompt from "./Prompt.svelte";

import type siyuan from "siyuan";

export type PromptCallback<T> = (
    value: string,
    dialog: InstanceType<typeof siyuan.Dialog>,
    component: InstanceType<typeof Prompt>,
) => Promise<T> | T;

export interface IPromptOptions {
    title: string; // 标题
    text?: string; // 说明文本
    value?: string; // 输入框默认文本
    placeholder?: string; // 输入框空白提示文本
    tips?: string; // 提示文本
    width?: string; // 宽度
    height?: string; // 高度
    listID?: string; // 数据列表 ID
    datalist?: string[]; // 输入框数据列表
    selectable?: boolean; // 是否可选择
    autofocus?: boolean; // 是否自动对焦
    input?: PromptCallback<string>; // 返回更新的提示文本
    change?: PromptCallback<string>; // 返回更新的提示文本
    confirm?: PromptCallback<boolean>; // 返回是否关闭
    cancel?: PromptCallback<boolean>; // 返回是否关闭
}

export interface IPromptReturn {
    id: string; // 对话框元素 ID
    dialog: InstanceType<typeof siyuan.Dialog>; // 对话框实例
    component: InstanceType<typeof Prompt>; // 组件实例
}

/* 异步提示输入框 */
export async function asyncPrompt(Dialog: typeof siyuan.Dialog, options: IPromptOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const confirm = options.confirm;
        const cancel = options.cancel;

        options.confirm = async (value, ...args) => {
            const result = await confirm?.call(options, value, ...args) ?? true;
            if (result)
                resolve(value);
            return result;
        };
        options.cancel = async (value, ...args) => {
            const result = await cancel?.call(options, value, ...args) ?? true;
            if (result)
                reject(value);
            return result;
        };

        // eslint-disable-next-line ts/no-use-before-define
        prompt(Dialog, options);
    });
}

/* 打开提示输入框 */
export function prompt(Dialog: typeof siyuan.Dialog, options: IPromptOptions): IPromptReturn {
    const id = `dialog-prompt-${Date.now()}`;

    const dialog = new Dialog({
        title: options.title,
        content: `<div id="${id}" class="fn__flex-column" />`,
        width: options.width || undefined,
        height: options.height || undefined,
        // eslint-disable-next-line ts/no-use-before-define
        destroyCallback: () => component?.$destroy(),
    });

    const component = new Prompt({
        target: dialog.element.querySelector(`#${id}`) as HTMLElement,
        props: {
            text: options.text,
            value: options.value,
            placeholder: options.placeholder,
            tips: options.tips,
            listID: options.listID,
            datalist: options.datalist,
            selectable: options.selectable,
            autofocus: options.autofocus,
        },
    });

    component.$on("input", async (e) => {
        if (options.input) {
            const tips = await options.input(
                e.detail.value,
                dialog,
                component,
            );
            component.$set({ tips });
        }
    });
    component.$on("change", async (e) => {
        if (options.change) {
            const tips = await options.change(
                e.detail.value,
                dialog,
                component,
            );
            component.$set({ tips });
        }
    });
    component.$on("confirm", async (e) => {
        const close = options.confirm
            ? await options.confirm(
                e.detail.value,
                dialog,
                component,
            )
            : true;
        if (close) {
            dialog.destroy();
        }
    });
    component.$on("cancel", async (e) => {
        const close = options.cancel
            ? await options.cancel(
                e.detail.value,
                dialog,
                component,
            )
            : true;
        if (close) {
            dialog.destroy();
        }
    });

    return {
        id,
        dialog,
        component,
    };
}

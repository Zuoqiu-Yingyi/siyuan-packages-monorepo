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

import { mount, unmount } from "svelte";

import Prompt, { type TProps as TPromptProps } from "./Prompt.v5.svelte";

import type siyuan from "siyuan";

export type PromptCallback<T> = (
    value: string,
    dialog: InstanceType<typeof siyuan.Dialog>,
    component: ReturnType<typeof mount>,
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
    component: ReturnType<typeof mount>; // 组件实例
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
    let component: ReturnType<typeof mount>;

    const dialog = new Dialog({
        title: options.title,
        content: `<div id="${id}" class="fn__flex-column" />`,
        width: options.width || undefined,
        height: options.height || undefined,

        destroyCallback: () => unmount(component),
    });

    const props: TPromptProps = $state({
        text: options.text,
        value: options.value,
        placeholder: options.placeholder,
        tips: options.tips,
        listID: options.listID,
        datalist: options.datalist,
        selectable: options.selectable,
        autofocus: options.autofocus,

        onInput: async (params) => {
            if (options.input) {
                const tips = await options.input(
                    params.value,
                    dialog,
                    component,
                );
                props.tips = tips;
            }
        },
        onChange: async (params) => {
            if (options.change) {
                const tips = await options.change(
                    params.value,
                    dialog,
                    component,
                );
                props.tips = tips;
            }
        },
        onConfirm: async (params) => {
            const close = options.confirm
                ? await options.confirm(
                    params.value,
                    dialog,
                    component,
                )
                : true;
            if (close) {
                dialog.destroy();
            }
        },
        onCancel: async (params) => {
            const close = options.cancel
                ? await options.cancel(
                    params.value,
                    dialog,
                    component,
                )
                : true;
            if (close) {
                dialog.destroy();
            }
        },
    });

    component = mount(Prompt, {
        target: dialog.element.querySelector(`#${id}`) as HTMLElement,
        props,
    });

    return {
        id,
        dialog,
        component,
    };
}

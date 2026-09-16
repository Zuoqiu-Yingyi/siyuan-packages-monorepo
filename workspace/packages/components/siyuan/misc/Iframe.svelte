<!--
 Copyright (C) 2023 Zuoqiu Yingyi

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<script
    lang="ts"
    module
>
    export interface IEvent {
        iframe: HTMLIFrameElement;
    }

    export interface IProps {
        src?: string; // iframe 资源路径
        title?: string; // iframe 标题路径
        /**
         * 控制 iframe 的权限策略
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#allow | allow - MDN}
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Permissions_Policy | 权限策略 - MDN}
         */
        allow?: null | string;
        /**
         * 控制 iframe 的内容安全策略
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#csp | csp - MDN}
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP | 内容安全策略 - MDN}
         */
        csp?: null | string;
        /**
         * 控制 iframe 内容加载优先级
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#importance | importance - MDN}
         */
        importance?: "auto" | "high" | "low" | null;
        /**
         * 嵌入的浏览上下文的名称
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#name | name - MDN}
         */
        name?: null | string;
        /**
         * 获取 iframe 资源时如何发送 referrer 首部
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#referrerpolicy | referrerpolicy - MDN}
         */
        referrerpolicy?: null | ReferrerPolicy;
        /**
         * 控制应用于嵌入在 <iframe> 中的内容的限制
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#sandbox | sandbox - MDN}
         */
        sandbox?: null | string;
        /**
         * 需要渲染的 HTML 代码
         * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#srcdoc | srcdoc - MDN}
         */
        srcdoc?: null | string;
    }

    export interface IHandlers {
        onCreate?: (params: IEvent) => void; // iframe 元素创建后调用
        onUpdate?: (params: IEvent) => void; // iframe 元素更新后调用
        onDestroy?: () => void; // iframe 元素销毁后调用
    }

    export type TProps = IProps & IHandlers;
</script>

<script lang="ts">
    import type { Action } from "svelte/action";

    const {
        src = "",
        title = "",

        allow = null,
        csp = null,
        importance = null,
        name = null,
        referrerpolicy = null,
        sandbox = null,
        srcdoc = null,

        onCreate,
        onUpdate,
        onDestroy,
    }: TProps = $props();

    let iframe: HTMLIFrameElement | undefined;

    /**
     * 在 iframe 元素创建时调用
     * https://svelte.dev/docs/svelte/use
     */
    const action: Action<HTMLIFrameElement> = (node) => {
        onCreate?.({ iframe: node });
        return {
            update(_parameter) {
                onUpdate?.({ iframe: iframe! });
            },
            destroy() {
                onDestroy?.();
            },
        };
    };
</script>

<iframe
    bind:this={iframe}
    {name}
    class="fn__flex fn__flex-1 iframe"
    {allow}
    {csp}
    {importance}
    {referrerpolicy}
    {sandbox}
    {src}
    {srcdoc}
    {title}
    use:action
></iframe>

<style>
    .iframe {
        border: 0;
    }
</style>

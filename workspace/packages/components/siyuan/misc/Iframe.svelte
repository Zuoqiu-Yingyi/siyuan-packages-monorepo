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

<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import type { Action } from "svelte/action";

    export let src: string = ""; // iframe 资源路径
    export let title: string = ""; // iframe 标题路径

    interface IEvent {
        iframe: HTMLIFrameElement;
    }
    const dispatcher = createEventDispatcher<{
        create: IEvent;
        update: IEvent;
        destroy: null;
    }>();

    let iframe: HTMLIFrameElement;

    /**
     * 控制 iframe 的权限策略
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#allow | allow - MDN}
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Permissions_Policy | 权限策略 - MDN}
     */
    export let allow: null | string = null;
    /**
     * 控制 iframe 的内容安全策略
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#csp | csp - MDN}
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP | 内容安全策略 - MDN}
     */
    export let csp: null | string = null;
    /**
     * 控制 iframe 内容加载优先级
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#importance | importance - MDN}
     */
    export let importance: "auto" | "high" | "low" | null = null;
    /**
     * 嵌入的浏览上下文的名称
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#name | name - MDN}
     */
    export let name: null | string = null;
    /**
     * 获取 iframe 资源时如何发送 referrer 首部
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#referrerpolicy | referrerpolicy - MDN}
     */
    export let referrerpolicy: null | ReferrerPolicy = null;
    /**
     * 控制应用于嵌入在 <iframe> 中的内容的限制
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#sandbox | sandbox - MDN}
     */
    export let sandbox: null | string = null;
    /**
     * 需要渲染的 HTML 代码
     * - {@link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#srcdoc | srcdoc - MDN}
     */
    export let srcdoc: null | string = null; // iframe 资源路径

    /**
     * 在 iframe 元素创建时调用
     * https://svelte.dev/docs/element-directives#use-action
     */
    const action: Action<HTMLIFrameElement> = (node) => {
        dispatcher("create", { iframe: node });
        return {
            update(_parameter) {
                dispatcher("update", { iframe });
            },
            destroy() {
                dispatcher("destroy");
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

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

    import { EditorBridgeMaster } from "@/bridge/EditorMaster";

    import { DEFAULT_EDITOR_PROPS } from "../configs/editor";

    import type { Action } from "svelte/action";

    import type MonacoEditorPlugin from "@/index";
    import type { IEditorEvents, IEditorProps } from "@/types/editor";

    export let plugin: InstanceType<typeof MonacoEditorPlugin>; // 插件对象

    export let diff: IEditorProps["diff"] = false;
    export let locale: IEditorProps["locale"] = DEFAULT_EDITOR_PROPS.locale;

    export let savable: IEditorProps["savable"] = DEFAULT_EDITOR_PROPS.savable;
    export let changeable: IEditorProps["changeable"] = DEFAULT_EDITOR_PROPS.changeable;

    export let original: IEditorProps["original"] = DEFAULT_EDITOR_PROPS.original;
    export let modified: IEditorProps["modified"] = DEFAULT_EDITOR_PROPS.modified;
    export let options: IEditorProps["options"] = DEFAULT_EDITOR_PROPS.options;
    export let originalOptions: IEditorProps["originalOptions"] = DEFAULT_EDITOR_PROPS.originalOptions;
    export let modifiedOptions: IEditorProps["modifiedOptions"] = DEFAULT_EDITOR_PROPS.modifiedOptions;
    export let diffOptions: IEditorProps["diffOptions"] = DEFAULT_EDITOR_PROPS.diffOptions;

    let inited = false;

    const dispatch = createEventDispatcher<IEditorEvents>();
    const bridge = new EditorBridgeMaster(
        plugin, //
        EditorBridgeMaster.createChannel(true), //
    );

    $: if (inited)
        bridge.set({ savable });
    $: if (inited)
        bridge.set({ changeable });
    $: if (inited)
        bridge.set({ original });
    $: if (inited)
        bridge.set({ modified });
    $: if (inited)
        bridge.set({ options });
    $: if (inited)
        bridge.set({ originalOptions });
    $: if (inited)
        bridge.set({ modifiedOptions });
    $: if (inited)
        bridge.set({ diffOptions });

    bridge.addEventListener("editor-ready", (e) => {
        // plugin.logger.debug("editor-ready");

        if (e.data.data.status) {
            bridge.init({
                name: plugin.name,
                i18n: plugin.i18n,

                diff,
                locale,

                savable,
                changeable,

                original,
                modified,
                options,
                originalOptions,
                modifiedOptions,
                diffOptions,
            });
            inited = true;
        }
        else {
            inited = false;
        }
    });
    bridge.addEventListener("editor-changed", (e) => {
        dispatch("changed", e.data.data);
    });
    bridge.addEventListener("editor-save", (e) => {
        dispatch("save", e.data.data);
    });
    bridge.addEventListener("editor-hover-siyuan", (e) => {
        dispatch("hover", e.data.data);
    });
    bridge.addEventListener("editor-open-siyuan", (e) => {
        dispatch("open", e.data.data);
    });

    /* 挂载编辑器 */
    const init: Action<HTMLIFrameElement> = function (iframe) {
        bridge.createEditorIframe(iframe);
        return {
            destroy() {
                bridge.destroy();
            },
        };
    };
</script>

<!--
    use:init: 挂载后调用 {@link init} 方法
    REF: https://svelte.dev/docs/svelte-action
 -->
<iframe
    class="fn__flex-1 editor"
    title={plugin.displayName}
    use:init
/>

<style>
    .editor {
        border: 0;
    }
</style>

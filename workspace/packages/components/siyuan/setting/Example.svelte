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

<!--
REF: https://github.com/siyuan-note/plugin-sample-vite-svelte/blob/main/src/libs/setting-panel.svelte
-->

<script lang="ts">
    import { showMessage } from "siyuan";
    import {
        onDestroy,
        onMount,
    } from "svelte";

    import Svg from "./../misc/Svg.svelte";
    import Group from "./item/Group.svelte";
    import Input from "./item/Input.svelte";
    import { ItemType } from "./item/item";
    import Item from "./item/Item.svelte";
    import MiniItem from "./item/MiniItem.svelte";
    import Panel from "./panel/Panel.svelte";
    import Panels from "./panel/Panels.svelte";
    import Tabs from "./tab/Tabs.svelte";

    let block = false;
    let normal = false;

    const panel_focus_key = 1;
    const panels = [
        {
            key: 1,
            text: "panel-example",
            name: "panel-example-name",
            icon: "#iconSettings",
        },
        {
            key: 2,
            text: "panel-test",
            name: "panel-test-name",
            icon: "",
        },
    ];
    const tab_focus_key = 1;
    const tabs = [
        {
            key: 1,
            text: "tab-example",
            name: "tab-example-name",
            icon: "🌰",
        },
        {
            key: 2,
            text: "tab-test",
            name: "tab-test-name",
            icon: "🧪",
        },
    ];

    const limits = {
        min: 0,
        max: 100,
        step: 1,
    };

    const options = [
        { key: "left", text: "Left" },
        { key: "center", text: "Center" },
        { key: "right", text: "Right" },
    ];

    onMount(() => {
        showMessage("Setting panel opened");
    });
    onDestroy(() => {
        showMessage("Setting panel closed");
    });
</script>

<!--
    You can use this template to quickly create a setting panel,
    with the same UI style in SiYuan
-->
<Panels
    focus={panel_focus_key}
    {panels}
    let:focus={panel_focus}
>
    <Panel display={panels[0]?.key === panel_focus}>
        <Tabs
            focus={tab_focus_key}
            {tabs}
            let:focus
        >
            <!-- 标签页 1 内容 -->
            <div
                class:fn__none={tabs[0]?.key !== focus}
                data-type={tabs[0]?.name}
            >
                <Item>
                    <h4 slot="title">This setting panel is provided by a svelte component</h4>
                    <span slot="text">
                        See:
                        <a href="https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo/tree/main/workspace/packages/components/siyuan/setting">siyuan-packages-monorepo/workspace/packages/components/siyuan/setting at main · Zuoqiu-Yingyi/siyuan-packages-monorepo · GitHub</a>
                    </span>
                </Item>

                <Item
                    {block}
                    text="This is a checkbox"
                    title="Checkbox"
                >
                    <Input
                        slot="input"
                        {block}
                        {normal}
                        settingKey="Checkbox"
                        settingValue={block}
                        type={ItemType.checkbox}
                        on:changed={(event) => {
                            showMessage(`Checkbox changed: ${event.detail.key} = ${event.detail.value}`);
                            setTimeout(() => (block = !block), 0);
                        }}
                    />
                </Item>

                <Item
                    {block}
                    text="This is a text input"
                    title="Input"
                >
                    <Input
                        slot="input"
                        {block}
                        {normal}
                        placeholder="Input something"
                        settingKey="Text"
                        settingValue=""
                        type={ItemType.text}
                        on:changed={(event) => {
                            showMessage(`Input changed: ${event.detail.key} = ${event.detail.value}`);
                        }}
                    />
                </Item>

                <Item
                    {block}
                    text="This is a number input"
                    title="Slide"
                >
                    <Input
                        slot="input"
                        {block}
                        {limits}
                        {normal}
                        settingKey="Number"
                        settingValue={50}
                        type={ItemType.number}
                        on:changed={(event) => {
                            showMessage(`Slide changed: ${event.detail.key} = ${event.detail.value}`);
                        }}
                    />
                </Item>

                <Item
                    {block}
                    text="This is a slide"
                    title="Slide"
                >
                    <Input
                        slot="input"
                        {block}
                        {limits}
                        {normal}
                        settingKey="Slide"
                        settingValue={50}
                        type={ItemType.slider}
                        on:changed={(event) => {
                            showMessage(`Slide changed: ${event.detail.key} = ${event.detail.value}`);
                        }}
                    />
                </Item>

                <Item
                    {block}
                    text="This is a button"
                    title="Button"
                >
                    <Input
                        slot="input"
                        {block}
                        {normal}
                        settingKey="Button"
                        settingValue="Click me"
                        type={ItemType.button}
                        on:clicked={() => {
                            showMessage("Button clicked");
                            setTimeout(() => (normal = !normal), 0);
                        }}
                    />
                </Item>

                <Item
                    {block}
                    text="This is a select"
                    title="Select"
                >
                    <Input
                        slot="input"
                        {block}
                        {normal}
                        {options}
                        settingKey="Select"
                        settingValue="left"
                        type={ItemType.select}
                        on:changed={(event) => {
                            showMessage(`Select changed: ${event.detail.key} = ${event.detail.value}`);
                        }}
                    />
                </Item>

                <Item
                    {block}
                    text="This is a textarea"
                    title="Textarea"
                >
                    <Input
                        slot="input"
                        {block}
                        {normal}
                        placeholder="Input something"
                        settingKey="Textarea"
                        settingValue=""
                        type={ItemType.textarea}
                        on:changed={(event) => {
                            showMessage(`Input changed: ${event.detail.key} = ${event.detail.value}`);
                        }}
                    />
                </Item>
            </div>

            <!-- 标签页 2 内容 -->
            <div
                class:fn__none={tabs[1]?.key !== focus}
                data-type={tabs[1]?.name}
            >
                <Group title="group-title <code class='fn__code'>code style</code>">
                    <MiniItem>
                        <Svg
                            slot="icon"
                            className="svg"
                            icon="#iconSettings"
                        />
                        <span slot="title">mini checkbox</span>
                        <Input
                            slot="input"
                            settingKey="Checkbox"
                            settingValue={block}
                            type={ItemType.checkbox}
                            on:changed={(event) => {
                                showMessage(`Checkbox changed: ${event.detail.key} = ${event.detail.value}`);
                                setTimeout(() => (block = !block), 0);
                            }}
                        />
                    </MiniItem>
                    <MiniItem>
                        <Svg
                            slot="icon"
                            className="svg"
                            icon="#iconParagraph"
                        />
                        <span slot="title">mini text</span>
                        <Input
                            slot="input"
                            placeholder="Input something"
                            settingKey="Text"
                            settingValue=""
                            type={ItemType.text}
                            on:changed={(event) => {
                                showMessage(`Input changed: ${event.detail.key} = ${event.detail.value}`);
                            }}
                        />
                    </MiniItem>
                    <MiniItem>
                        <Svg
                            slot="icon"
                            className="svg"
                            icon="#iconSpreadOdd"
                        />
                        <span slot="title">mini number</span>
                        <Input
                            slot="input"
                            {limits}
                            settingKey="Number"
                            settingValue={50}
                            type={ItemType.number}
                            on:changed={(event) => {
                                showMessage(`Slide changed: ${event.detail.key} = ${event.detail.value}`);
                            }}
                        />
                    </MiniItem>
                    <MiniItem>
                        <Svg
                            slot="icon"
                            className="svg"
                            icon="#iconScrollHoriz"
                        />
                        <span slot="title">mini slide</span>
                        <Input
                            slot="input"
                            {limits}
                            settingKey="Slide"
                            settingValue={50}
                            type={ItemType.slider}
                            on:changed={(event) => {
                                showMessage(`Slide changed: ${event.detail.key} = ${event.detail.value}`);
                            }}
                        />
                    </MiniItem>
                    <MiniItem>
                        <Svg
                            slot="icon"
                            className="svg"
                            icon="#iconSelectText"
                        />
                        <span slot="title">mini button</span>
                        <Input
                            slot="input"
                            settingKey="Button"
                            settingValue="Click me"
                            type={ItemType.button}
                            on:clicked={() => {
                                showMessage("Button clicked");
                                setTimeout(() => (normal = !normal), 0);
                            }}
                        />
                    </MiniItem>
                    <MiniItem>
                        <Svg
                            slot="icon"
                            className="svg"
                            icon="#iconDown"
                        />
                        <span slot="title">mini select</span>
                        <Input
                            slot="input"
                            {options}
                            settingKey="Select"
                            settingValue="left"
                            type={ItemType.select}
                            on:changed={(event) => {
                                showMessage(`Select changed: ${event.detail.key} = ${event.detail.value}`);
                            }}
                        />
                    </MiniItem>
                    <MiniItem>
                        <Svg
                            slot="icon"
                            className="svg"
                            icon="#iconAlignLeft"
                        />
                        <span slot="title">mini textarea</span>
                        <Input
                            slot="input"
                            placeholder="Input something"
                            settingKey="Textarea"
                            settingValue=""
                            type={ItemType.textarea}
                            on:changed={(event) => {
                                showMessage(`Input changed: ${event.detail.key} = ${event.detail.value}`);
                            }}
                        />
                    </MiniItem>
                </Group>
            </div>
        </Tabs>
    </Panel>

    <Panel display={panels[1]?.key === panel_focus}>Empty Panel</Panel>
</Panels>

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

    import { ItemType } from "./item/item";

    import Svg from "./../misc/Svg.svelte";
    import Group from "./item/Group.svelte";
    import Input from "./item/Input.svelte";
    import Item from "./item/Item.svelte";
    import MiniItem from "./item/MiniItem.svelte";
    import Panel from "./panel/Panel.svelte";
    import Panels from "./panel/Panels.svelte";
    import Tabs from "./tab/Tabs.svelte";

    let block = $state(false);
    let normal = $state(false);

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
>
    {#snippet children(panel_focus)}
        <Panel display={panels[0]?.key === panel_focus}>
            <Tabs
                focus={tab_focus_key}
                {tabs}
            >
                {#snippet children(focus)}
                    <!-- 标签页 1 内容 -->
                    <div
                        class:fn__none={tabs[0]?.key !== focus}
                        data-type={tabs[0]?.name}
                    >
                        <Item>
                            {#snippet titleSlot()}
                                <h4>This setting panel is provided by a svelte component</h4>
                            {/snippet}
                            {#snippet textSlot()}
                                <span>
                                    See:
                                    <a href="https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo/tree/main/workspace/packages/components/siyuan/setting">siyuan-packages-monorepo/workspace/packages/components/siyuan/setting at main · Zuoqiu-Yingyi/siyuan-packages-monorepo · GitHub</a>
                                </span>
                            {/snippet}
                        </Item>

                        <Item
                            {block}
                            text="This is a checkbox"
                            title="Checkbox"
                        >
                            {#snippet input()}
                                <Input
                                    {block}
                                    {normal}
                                    onChanged={(event) => {
                                        showMessage(`Checkbox changed: ${event.key} = ${event.value}`);
                                        setTimeout(() => (block = !block), 0);
                                    }}
                                    settingKey="Checkbox"
                                    settingValue={block}
                                    type={ItemType.checkbox}
                                />
                            {/snippet}
                        </Item>

                        <Item
                            {block}
                            text="This is a text input"
                            title="Input"
                        >
                            {#snippet input()}
                                <Input
                                    {block}
                                    {normal}
                                    onChanged={(event) => {
                                        showMessage(`Input changed: ${event.key} = ${event.value}`);
                                    }}
                                    placeholder="Input something"
                                    settingKey="Text"
                                    settingValue=""
                                    type={ItemType.text}
                                />
                            {/snippet}
                        </Item>

                        <Item
                            {block}
                            text="This is a number input"
                            title="Slide"
                        >
                            {#snippet input()}
                                <Input
                                    {block}
                                    {limits}
                                    {normal}
                                    onChanged={(event) => {
                                        showMessage(`Slide changed: ${event.key} = ${event.value}`);
                                    }}
                                    settingKey="Number"
                                    settingValue={50}
                                    type={ItemType.number}
                                />
                            {/snippet}
                        </Item>

                        <Item
                            {block}
                            text="This is a slide"
                            title="Slide"
                        >
                            {#snippet input()}
                                <Input
                                    {block}
                                    {limits}
                                    {normal}
                                    onChanged={(event) => {
                                        showMessage(`Slide changed: ${event.key} = ${event.value}`);
                                    }}
                                    settingKey="Slide"
                                    settingValue={50}
                                    type={ItemType.slider}
                                />
                            {/snippet}
                        </Item>

                        <Item
                            {block}
                            text="This is a button"
                            title="Button"
                        >
                            {#snippet input()}
                                <Input
                                    {block}
                                    {normal}
                                    onClicked={() => {
                                        showMessage("Button clicked");
                                        setTimeout(() => (normal = !normal), 0);
                                    }}
                                    settingKey="Button"
                                    settingValue="Click me"
                                    type={ItemType.button}
                                />
                            {/snippet}
                        </Item>

                        <Item
                            {block}
                            text="This is a select"
                            title="Select"
                        >
                            {#snippet input()}
                                <Input
                                    {block}
                                    {normal}
                                    onChanged={(event) => {
                                        showMessage(`Select changed: ${event.key} = ${event.value}`);
                                    }}
                                    {options}
                                    settingKey="Select"
                                    settingValue="left"
                                    type={ItemType.select}
                                />
                            {/snippet}
                        </Item>

                        <Item
                            {block}
                            text="This is a textarea"
                            title="Textarea"
                        >
                            {#snippet input()}
                                <Input
                                    {block}
                                    {normal}
                                    onChanged={(event) => {
                                        showMessage(`Input changed: ${event.key} = ${event.value}`);
                                    }}
                                    placeholder="Input something"
                                    settingKey="Textarea"
                                    settingValue=""
                                    type={ItemType.textarea}
                                />
                            {/snippet}
                        </Item>
                    </div>

                    <!-- 标签页 2 内容 -->
                    <div
                        class:fn__none={tabs[1]?.key !== focus}
                        data-type={tabs[1]?.name}
                    >
                        <Group title="group-title <code class='fn__code'>code style</code>">
                            <MiniItem>
                                {#snippet icon()}
                                    <Svg
                                        className="svg"
                                        icon="#iconSettings"
                                    />
                                {/snippet}
                                {#snippet title()}
                                    <span>mini checkbox</span>
                                {/snippet}
                                {#snippet input()}
                                    <Input
                                        onChanged={(event) => {
                                            showMessage(`Checkbox changed: ${event.key} = ${event.value}`);
                                            setTimeout(() => (block = !block), 0);
                                        }}
                                        settingKey="Checkbox"
                                        settingValue={block}
                                        type={ItemType.checkbox}
                                    />
                                {/snippet}
                            </MiniItem>
                            <MiniItem>
                                {#snippet icon()}
                                    <Svg
                                        className="svg"
                                        icon="#iconParagraph"
                                    />
                                {/snippet}
                                {#snippet title()}
                                    <span>mini text</span>
                                {/snippet}
                                {#snippet input()}
                                    <Input
                                        onChanged={(event) => {
                                            showMessage(`Input changed: ${event.key} = ${event.value}`);
                                        }}
                                        placeholder="Input something"
                                        settingKey="Text"
                                        settingValue=""
                                        type={ItemType.text}
                                    />
                                {/snippet}
                            </MiniItem>
                            <MiniItem>
                                {#snippet icon()}
                                    <Svg
                                        className="svg"
                                        icon="#iconSpreadOdd"
                                    />
                                {/snippet}
                                {#snippet title()}
                                    <span>mini number</span>
                                {/snippet}
                                {#snippet input()}
                                    <Input
                                        {limits}
                                        onChanged={(event) => {
                                            showMessage(`Slide changed: ${event.key} = ${event.value}`);
                                        }}
                                        settingKey="Number"
                                        settingValue={50}
                                        type={ItemType.number}
                                    />
                                {/snippet}
                            </MiniItem>
                            <MiniItem>
                                {#snippet icon()}
                                    <Svg
                                        className="svg"
                                        icon="#iconScrollHoriz"
                                    />
                                {/snippet}
                                {#snippet title()}
                                    <span>mini slide</span>
                                {/snippet}
                                {#snippet input()}
                                    <Input
                                        {limits}
                                        onChanged={(event) => {
                                            showMessage(`Slide changed: ${event.key} = ${event.value}`);
                                        }}
                                        settingKey="Slide"
                                        settingValue={50}
                                        type={ItemType.slider}
                                    />
                                {/snippet}
                            </MiniItem>
                            <MiniItem>
                                {#snippet icon()}
                                    <Svg
                                        className="svg"
                                        icon="#iconSelectText"
                                    />
                                {/snippet}
                                {#snippet title()}
                                    <span>mini button</span>
                                {/snippet}
                                {#snippet input()}
                                    <Input
                                        onClicked={() => {
                                            showMessage("Button clicked");
                                            setTimeout(() => (normal = !normal), 0);
                                        }}
                                        settingKey="Button"
                                        settingValue="Click me"
                                        type={ItemType.button}
                                    />
                                {/snippet}
                            </MiniItem>
                            <MiniItem>
                                {#snippet icon()}
                                    <Svg
                                        className="svg"
                                        icon="#iconDown"
                                    />
                                {/snippet}
                                {#snippet title()}
                                    <span>mini select</span>
                                {/snippet}
                                {#snippet input()}
                                    <Input
                                        onChanged={(event) => {
                                            showMessage(`Select changed: ${event.key} = ${event.value}`);
                                        }}
                                        {options}
                                        settingKey="Select"
                                        settingValue="left"
                                        type={ItemType.select}
                                    />
                                {/snippet}
                            </MiniItem>
                            <MiniItem>
                                {#snippet icon()}
                                    <Svg
                                        className="svg"
                                        icon="#iconAlignLeft"
                                    />
                                {/snippet}
                                {#snippet title()}
                                    <span>mini textarea</span>
                                {/snippet}
                                {#snippet input()}
                                    <Input
                                        onChanged={(event) => {
                                            showMessage(`Input changed: ${event.key} = ${event.value}`);
                                        }}
                                        placeholder="Input something"
                                        settingKey="Textarea"
                                        settingValue=""
                                        type={ItemType.textarea}
                                    />
                                {/snippet}
                            </MiniItem>
                        </Group>
                    </div>
                {/snippet}
            </Tabs>
        </Panel>

        <Panel display={panels[1]?.key === panel_focus}>
            Empty Panel
        </Panel>
    {/snippet}
</Panels>

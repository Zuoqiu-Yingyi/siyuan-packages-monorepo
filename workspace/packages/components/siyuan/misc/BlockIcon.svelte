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
    import { onDestroy } from "svelte";
    import {
        writable,
        type Unsubscriber,
    } from "svelte/store";

    import Svg from "./Svg.svelte";
    import { TooltipsDirection } from "./tooltips";

    import type {
        IBlockIconProps,
        IBlockIconStores,
    } from "./index";

    export let icon: NonNullable<IBlockIconProps["icon"]> = "#iconHelp";

    export let tag: NonNullable<IBlockIconProps["icon"]> = "button";
    export let show: NonNullable<IBlockIconProps["show"]> = true;
    export let none: NonNullable<IBlockIconProps["none"]> = false;
    export let active: NonNullable<IBlockIconProps["active"]> = false;
    export let disabled: NonNullable<IBlockIconProps["disabled"]> = false;

    export let type: NonNullable<IBlockIconProps["type"]> = "";
    export let ariaLabel: NonNullable<IBlockIconProps["ariaLabel"]> = "";
    export let tooltipsDirection: NonNullable<IBlockIconProps["tooltipsDirection"]> = TooltipsDirection.none;
    export let onClick: NonNullable<IBlockIconProps["onClick"]> = () => null;

    let element: HTMLElement;

    /* 外部响应式变量 */
    const props = {
        icon: writable(icon),
        show: writable(show),
        none: writable(none),
        active: writable(active),
        disabled: writable(disabled),
        type: writable(type),
        ariaLabel: writable(ariaLabel),
        tooltipsDirection: writable(tooltipsDirection),
    } as const satisfies IBlockIconStores;

    $: props.icon.set(icon);
    $: props.show.set(show);
    $: props.none.set(none);
    $: props.active.set(active);
    $: props.disabled.set(disabled);
    $: props.type.set(type);
    $: props.ariaLabel.set(ariaLabel);
    $: props.tooltipsDirection.set(tooltipsDirection);

    const unsubscribes: Unsubscriber[] = [
        props.icon.subscribe((v) => (icon = v)), //
        props.show.subscribe((v) => (show = v)), //
        props.none.subscribe((v) => (none = v)), //
        props.active.subscribe((v) => (active = v)), //
        props.disabled.subscribe((v) => (disabled = v)), //
        props.type.subscribe((v) => (type = v)), //
        props.ariaLabel.subscribe((v) => (ariaLabel = v)), //
        props.tooltipsDirection.subscribe((v) => (tooltipsDirection = v)), //
    ];

    onDestroy(() => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
    });
</script>

<!--
    动态标签名
    REF: https://svelte.dev/docs/special-elements#svelte-element
-->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<svelte:element
    this={tag}
    bind:this={element}
    class="block__icon fn__flex-center {tooltipsDirection}"
    class:b3-tooltips={tooltipsDirection !== TooltipsDirection.none}
    class:block__icon--show={show}
    class:fn__none={none}
    class:toolbar__item--active={active}
    class:toolbar__item--disabled={disabled}
    data-type={type}
    aria-label={ariaLabel}
    role="button"
    on:click
    on:dblclick
    on:click={(e) => onClick(e, element, props)}
>
    <Svg {icon} />
</svelte:element>

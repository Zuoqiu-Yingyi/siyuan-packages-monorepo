# Code Style Notes

## Languages and Frameworks

The workspace is TypeScript ESM. Packages use the framework already present in their directory, commonly Vite with Svelte or Vue. Do not introduce a new framework or global state pattern for a local fix unless the user explicitly asks.

## Formatting

The shared config is `@workspace/eslint-config-custom`, wired through `workspace/eslint.config.js`. Prettier settings live in `workspace/.prettierrc.toml`.

Current formatting conventions:

- 4-space indentation.
- Double quotes.
- Semicolons.
- LF line endings.
- Trailing commas where supported.
- One attribute per line in Vue/Svelte templates.
- YAML indentation is 2 spaces.

Use `pnpm -C workspace run lint` to check and `pnpm -C workspace run format` for autofix formatting.

## Naming

Use kebab-case for package directories such as `custom-block` and `monaco-editor`. Shared workspace packages use scoped names such as `@workspace/utils`. Prefer existing local naming patterns over creating new abstractions.

## Svelte Components

All Svelte source in this repository is written in Svelte 5 runes mode. Legacy Svelte 4 syntax (`export let`, `$:`, `createEventDispatcher`, `<slot>`, `on:event`, `svelte:self`, `$$props`, `$$slots`) is no longer used.

Component contracts are declared in a `module` script block and consumed with `$props()`:

```svelte
<script
    lang="ts"
    module
>
    import type { Snippet } from "svelte";

    export interface IProps {
        title?: string; // 属性
    }

    export interface IHandlers {
        onChanged?: (params: { value: string }) => void; // 回调属性
    }

    export interface ISlots {
        input?: Snippet; // snippet
    }

    export type TProps = IProps & IHandlers & ISlots;
</script>

<script lang="ts">
    const { title = "", onChanged, input }: TProps = $props();
</script>
```

Conventions that follow from this:

- Consumers import a component's prop types as `import type { IProps as IXxxProps } from "...Xxx.svelte"` instead of using `ComponentProps<Xxx>`.
- Component events are callback props named `onXxx` receiving the payload directly (no `CustomEvent`, no `event.detail`).
- Named slots become snippets. When a snippet name would collide with a prop name, the snippet gets a `Slot` suffix (`titleSlot`, `textSlot`, `iconSlot`, `breadcrumbSlot`).
- Props that the component itself reassigns are declared with `$bindable()`.
- Event modifiers were removed from Svelte 5; use the wrappers in `@workspace/utils/svelte/event` (`stopPropagation`, `preventDefault`, `self`, `once`, ...). The Svelte 4 wrapping order is `self(stopPropagation(preventDefault(handler)))`, and `|capture` becomes the `onxxxcapture` attribute.
- Mount components imperatively with `mount()` / `unmount()` from `svelte`. There is no `$set` / `$on` / `$destroy`: to update props after mount, pass a reactive object (`state()` from `@workspace/utils/svelte/runes.svelte`) to `mount` and mutate it.

## Documentation TODOs

- TODO: add UI-specific conventions if this repo standardizes them beyond package-local patterns.
- TODO: document public API stability rules for `packages/*`.

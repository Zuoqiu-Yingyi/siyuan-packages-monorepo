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

## Documentation TODOs

- TODO: add UI-specific conventions if this repo standardizes them beyond package-local patterns.
- TODO: document public API stability rules for `packages/*`.

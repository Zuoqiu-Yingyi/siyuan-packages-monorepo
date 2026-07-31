# Project Notes

## Structure

This repository is a monorepo for SiYuan community packages. The root contains project metadata, `CHANGELOG.md`, global helper scripts, and agent entry files. The active pnpm workspace is `workspace/`.

Workspace package groups are declared in `workspace/pnpm-workspace.yaml`:

- `workspace/plugins/*`: SiYuan plugins, usually Vite apps with `src/`, `public/`, and generated `dist/`.
- `workspace/widgets/*`: SiYuan widgets, currently including `metadata` and `panorama-viewer`.
- `workspace/packages/*`: shared workspace libraries, including `@workspace/types`, `@workspace/utils`, and `@workspace/components`.
- `workspace/tools/*`: shared internal config packages such as ESLint and TypeScript config.

Generated output normally goes to `dist/**` and is listed as a Turborepo build output.

## Commands

Run commands from the repository root unless a task requires entering a package directory.

```bash
pnpm -C workspace install
pnpm -C workspace run submodule:update
pnpm -C workspace run dev
pnpm -C workspace run build
pnpm -C workspace run build:dev
pnpm -C workspace run lint
pnpm -C workspace run format
pnpm -C workspace --filter custom-block run build
```

The root `workspace/.husky/pre-commit` hook runs `pnpm run lint-staged` and `pnpm run build:dev` from inside `workspace/`.

## Architecture TODOs

- TODO: document package ownership and release expectations.
- TODO: document which generated `dist/` files should be committed for each plugin or widget.

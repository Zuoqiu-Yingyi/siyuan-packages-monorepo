# Testing and Verification Notes

## Current State

TODO: this repository does not currently define a repository-wide `test` script, test framework, or coverage threshold.

## Baseline Verification

For code changes, run the smallest meaningful verification set and report exact commands and outcomes.

Common checks:

```bash
pnpm -C workspace run lint
pnpm -C workspace run build:dev
pnpm -C workspace --filter <plugin-name> run check:svelte
pnpm -C workspace --filter <package-name> run build
```

Svelte plugins generally expose `check:svelte`. Use it when changing Svelte source in a package that has that script.

For docs-only changes, verification may be:

```text
N/A (docs only)
```

## Adding Tests

If a package introduces tests, keep them package-local, add an explicit package script, and document fixtures or required external services. Prefer colocated test names such as `*.test.ts` or `*.spec.ts`.

## Verification TODOs

- TODO: choose a standard test runner if shared test coverage becomes required.
- TODO: define package-level expectations for integration or UI smoke tests.

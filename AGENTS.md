# Repository Guidelines

> This is the project-level instruction entry for AI coding agents. Keep it short. Put details in `docs/agents/`.

## Mandatory Rules

- Use the user's language when communicating with the user.
- Preserve the dirty worktree. Do not revert or overwrite unrelated local changes.
- Active development is under `workspace/`; run package commands with `pnpm -C workspace ...`.
- Do not invent project mechanisms. If this repository has no command, policy, or test suite for something, mark it as `TODO` in docs.
- Before claiming code changes are ready, run the relevant verification commands and report exact results. For docs-only changes, `N/A (docs only)` is acceptable.
- When changing commands, hooks, package structure, build output, or agent rules, update the related documentation in the same change.

## Project Snapshot

| Item | Current Value |
|---|---|
| Project | SiYuan community packages monorepo |
| Workspace | `workspace/` |
| Package manager | `pnpm@11.17.0` |
| Build system | Turborepo + Vite |
| Main package groups | `plugins/*`, `widgets/*`, `packages/*`, `tools/*` |
| Test command | TODO: no repository-wide test script is defined |

## Context Index

Read only the files needed for the task:

- Project layout and commands: `docs/agents/project.md`
- Coding style and naming: `docs/agents/code-style.md`
- Testing and verification: `docs/agents/testing.md`
- Git, commits, and PRs: `docs/agents/git.md`

## Common Commands

```bash
pnpm -C workspace install
pnpm -C workspace run submodule:update
pnpm -C workspace run dev
pnpm -C workspace run build
pnpm -C workspace run build:dev
pnpm -C workspace run lint
pnpm -C workspace run format
pnpm -C workspace --filter <package-name> run <script>
```

## Agent Workflow

1. Inspect the smallest relevant context and current git status.
2. Make scoped edits that follow existing package patterns.
3. Update docs when behavior, commands, hooks, or agent guidance changes.
4. Run verification appropriate to the change.
5. Summarize changed files, verification results, and any remaining TODO or risk.

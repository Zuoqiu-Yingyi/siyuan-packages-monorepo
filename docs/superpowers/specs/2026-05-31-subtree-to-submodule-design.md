# Design: Migrate from git subtree to git submodule

**Date:** 2026-05-31
**Status:** Approved

## Context

`siyuan-packages-monorepo` currently manages 13 sub-repositories via `git subtree`. Each subtree's content is embedded directly in the monorepo's git history. Sub-repos serve as read-only mirrors; all development happens in the monorepo.

## Goals

- Replace subtree-embedded directories with submodule gitlink pointers
- Preserve existing `workspace:^` dependencies (plugins depend on shared packages in `workspace/packages/`)
- No history rewrite — add a single new commit on top of `main`
- Sub-repos remain read-only mirrors; workflow is monorepo-only

## Non-Goals

- Making sub-repos independently buildable
- Replacing or updating `scripts/git-subtree/` scripts
- Publishing `@workspace/*` packages to npm

## Final State

After migration:

| Item | Before | After |
|------|--------|-------|
| `workspace/plugins/*`, `workspace/widgets/*` | Directory content embedded in git history | gitlink (mode 160000) pointer |
| `.gitmodules` | Does not exist | Created with 13 submodule entries |
| `pnpm-workspace.yaml` | Unchanged | Unchanged |
| `scripts/git-subtree/` | Unchanged | Unchanged |
| sub-repo commit pointed to | Remote HEAD (just pushed) | Same commit |

After cloning, `git submodule update --init --recursive` is required before `pnpm install` can resolve `workspace:^` dependencies.

## Submodule Inventory

| Path | Repository | Branch |
|------|-----------|--------|
| workspace/plugins/custom-block | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-custom-block.git | dev |
| workspace/plugins/custom-fonts | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-custom-fonts.git | dev |
| workspace/plugins/inbox | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox.git | dev |
| workspace/plugins/jupyter-client | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-jupyter-client.git | dev |
| workspace/plugins/keepass | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass.git | dev |
| workspace/widgets/metadata | https://github.com/Zuoqiu-Yingyi/widget-metadata.git | dev |
| workspace/plugins/monaco-editor | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-monaco-editor.git | dev |
| workspace/plugins/open-api | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-open-api.git | dev |
| workspace/plugins/opencc | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc.git | dev |
| workspace/plugins/template | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-template.git | main |
| workspace/plugins/typewriter | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-typewriter.git | dev |
| workspace/plugins/wakatime | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-wakatime.git | dev |
| workspace/plugins/webview | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-webview.git | dev |

## Execution Steps

All steps produce a single commit on `main`. Use the repository-local git user (`Yingyi / 颖逸 <49649786+Zuoqiu-Yingyi@users.noreply.github.com>`), not the system global config.

1. Verify each submodule's target commit (remote HEAD after recent pushes)
2. For each of the 13 paths: `git rm -r --cached <path>` + `rm -rf <path>`
3. For each: `git submodule add -b <branch> <url> <path>`
4. `git submodule update --init`
5. Single `git commit`
6. `git push origin main`

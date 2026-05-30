# Subtree → Submodule Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 13 git subtree directories with git submodule gitlink pointers in a single commit on `main`.

**Architecture:** Remove each subtree directory from the git index and working tree, register it as a submodule via `.gitmodules`, then commit once. The monorepo's pnpm workspace and shared package dependencies are untouched. Sub-repos are read-only mirrors; all development continues in the monorepo.

**Tech Stack:** git 2.50+, pnpm workspace (unchanged)

---

## Reference: Submodule Inventory

| Name | Path | URL | Branch | Expected HEAD |
|------|------|-----|--------|--------------|
| custom-block | workspace/plugins/custom-block | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-custom-block.git | dev | be56993ba17a2b81f48e0bbc41fb830fca93196a |
| custom-fonts | workspace/plugins/custom-fonts | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-custom-fonts.git | dev | 511d3b21484ced0f08cf38170d179aed12421333 |
| inbox | workspace/plugins/inbox | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox.git | dev | 2b2fa19855d66595e927032be7ad01f4e63fd98d |
| jupyter-client | workspace/plugins/jupyter-client | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-jupyter-client.git | dev | 86e79c97f52ad8cbaf87a64ccd73a3238734503f |
| keepass | workspace/plugins/keepass | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass.git | dev | 36bb010e967eb4fe7bbf0c2ea9c9d82a2cbdf623 |
| metadata | workspace/widgets/metadata | https://github.com/Zuoqiu-Yingyi/widget-metadata.git | dev | eab11499520b0dde8aeefd6f6c5b64326082b982 |
| monaco-editor | workspace/plugins/monaco-editor | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-monaco-editor.git | dev | 9dd19a51e62ef4505fabb3ae99a2eb6e248ca94b |
| open-api | workspace/plugins/open-api | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-open-api.git | dev | 4f6671351f159bfd514fd39112cd4769cb9faba8 |
| opencc | workspace/plugins/opencc | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc.git | dev | c94708433f6cc2091a0c5d61d5dfca835f410e2a |
| template | workspace/plugins/template | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-template.git | main | 8e29d2c937e2311bd30830b8b070c6e248faa93a |
| typewriter | workspace/plugins/typewriter | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-typewriter.git | dev | 820671575f16e1635e35e9b734486de1a605477f |
| wakatime | workspace/plugins/wakatime | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-wakatime.git | dev | a1b5eca719a64f84cb2f49466baf942459d537ae |
| webview | workspace/plugins/webview | https://github.com/Zuoqiu-Yingyi/siyuan-plugin-webview.git | dev | e8fbae18fbfefb5ebd7a099380589f26e95a0465 |

---

## Task 1: Verify pre-conditions

**Files:** none modified

- [ ] **Step 1: Confirm working tree is clean**

```bash
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo status --short
```

Expected: empty output (no modified or untracked files).

- [ ] **Step 2: Confirm no existing submodules**

```bash
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo submodule status
```

Expected: empty output.

- [ ] **Step 3: Confirm repo-local user is set**

```bash
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo config user.name
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo config user.email
```

Expected:
```
Yingyi / 颖逸
49649786+Zuoqiu-Yingyi@users.noreply.github.com
```

- [ ] **Step 4: Confirm all 13 subtree directories exist**

```bash
ls /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/
ls /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/widgets/
```

Expected plugins: `custom-block custom-fonts inbox jupyter-client keepass monaco-editor open-api opencc template typewriter wakatime webview`
Expected widgets: `metadata`

---

## Task 2: Remove all 13 subtree directories from the index and working tree

**Files:** removes `workspace/plugins/*/` and `workspace/widgets/metadata/` entirely

- [ ] **Step 1: Remove all 12 plugin subtrees from git index**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git rm -r --cached workspace/plugins/custom-block
git rm -r --cached workspace/plugins/custom-fonts
git rm -r --cached workspace/plugins/inbox
git rm -r --cached workspace/plugins/jupyter-client
git rm -r --cached workspace/plugins/keepass
git rm -r --cached workspace/plugins/monaco-editor
git rm -r --cached workspace/plugins/open-api
git rm -r --cached workspace/plugins/opencc
git rm -r --cached workspace/plugins/template
git rm -r --cached workspace/plugins/typewriter
git rm -r --cached workspace/plugins/wakatime
git rm -r --cached workspace/plugins/webview
```

Expected: each command prints `rm 'workspace/plugins/<name>/...'` lines, no errors.

- [ ] **Step 2: Remove widget subtree from git index**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git rm -r --cached workspace/widgets/metadata
```

Expected: prints `rm 'workspace/widgets/metadata/...'` lines, no errors.

- [ ] **Step 3: Delete working tree directories**

```bash
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/custom-block
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/custom-fonts
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/inbox
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/jupyter-client
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/keepass
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/monaco-editor
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/open-api
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/opencc
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/template
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/typewriter
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/wakatime
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/webview
rm -rf /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/widgets/metadata
```

- [ ] **Step 4: Verify directories are gone**

```bash
ls /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/plugins/
ls /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/workspace/widgets/
```

Expected: both directories are empty (or `widgets/` may disappear entirely).

---

## Task 3: Register all 13 submodules

**Files:** creates `.gitmodules`, creates `.git/modules/` entries, creates gitlink entries in index

Run each `git submodule add` from the repo root. The `-b` flag sets the tracked branch. Each command clones the sub-repo and stages the gitlink.

- [ ] **Step 1: Add custom-block**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-custom-block.git workspace/plugins/custom-block
```

Expected: clones repo, prints `Cloning into '.../workspace/plugins/custom-block'...`

- [ ] **Step 2: Add custom-fonts**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-custom-fonts.git workspace/plugins/custom-fonts
```

- [ ] **Step 3: Add inbox**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox.git workspace/plugins/inbox
```

- [ ] **Step 4: Add jupyter-client**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-jupyter-client.git workspace/plugins/jupyter-client
```

- [ ] **Step 5: Add keepass**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass.git workspace/plugins/keepass
```

- [ ] **Step 6: Add metadata**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/widget-metadata.git workspace/widgets/metadata
```

- [ ] **Step 7: Add monaco-editor**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-monaco-editor.git workspace/plugins/monaco-editor
```

- [ ] **Step 8: Add open-api**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-open-api.git workspace/plugins/open-api
```

- [ ] **Step 9: Add opencc**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc.git workspace/plugins/opencc
```

- [ ] **Step 10: Add template**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b main https://github.com/Zuoqiu-Yingyi/siyuan-plugin-template.git workspace/plugins/template
```

- [ ] **Step 11: Add typewriter**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-typewriter.git workspace/plugins/typewriter
```

- [ ] **Step 12: Add wakatime**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-wakatime.git workspace/plugins/wakatime
```

- [ ] **Step 13: Add webview**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule add -b dev https://github.com/Zuoqiu-Yingyi/siyuan-plugin-webview.git workspace/plugins/webview
```

---

## Task 4: Verify submodule state

**Files:** read-only verification

- [ ] **Step 1: Confirm .gitmodules was created with 13 entries**

```bash
grep -c '^\[submodule' /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo/.gitmodules
```

Expected: `13`

- [ ] **Step 2: Confirm all 13 submodules are registered**

```bash
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo submodule status
```

Expected: 13 lines, each starting with a commit hash followed by the path. Lines should start with ` ` (space = checked out at correct commit) not `-` (not initialized) or `+` (different commit).

- [ ] **Step 3: Confirm each submodule points to the expected HEAD commit**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git submodule foreach 'echo "$name: $(git rev-parse HEAD)"'
```

Expected output (order may vary):
```
custom-block:   be56993ba17a2b81f48e0bbc41fb830fca93196a
custom-fonts:   511d3b21484ced0f08cf38170d179aed12421333
inbox:          2b2fa19855d66595e927032be7ad01f4e63fd98d
jupyter-client: 86e79c97f52ad8cbaf87a64ccd73a3238734503f
keepass:        36bb010e967eb4fe7bbf0c2ea9c9d82a2cbdf623
metadata:       eab11499520b0dde8aeefd6f6c5b64326082b982
monaco-editor:  9dd19a51e62ef4505fabb3ae99a2eb6e248ca94b
open-api:       4f6671351f159bfd514fd39112cd4769cb9faba8
opencc:         c94708433f6cc2091a0c5d61d5dfca835f410e2a
template:       8e29d2c937e2311bd30830b8b070c6e248faa93a
typewriter:     820671575f16e1635e35e9b734486de1a605477f
wakatime:       a1b5eca719a64f84cb2f49466baf942459d537ae
webview:        e8fbae18fbfefb5ebd7a099380589f26e95a0465
```

- [ ] **Step 4: Confirm staged changes look correct**

```bash
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo diff --cached --stat
```

Expected: shows deletions for all old subtree files, additions for `.gitmodules`, and 13 new gitlink entries (mode 160000).

---

## Task 5: Commit and push

**Files:** finalizes `.gitmodules` and 13 gitlink entries into one commit

- [ ] **Step 1: Commit using repo-local user**

```bash
cd /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo
git -c user.name="Yingyi / 颖逸" \
    -c user.email="49649786+Zuoqiu-Yingyi@users.noreply.github.com" \
    commit -m "refactor: migrate subtrees to submodules

Replace all 13 git subtree directories with git submodule gitlink
pointers. Sub-repos remain read-only mirrors; all development
continues in the monorepo. pnpm workspace:^ dependencies unchanged."
```

Expected: `[main <hash>] refactor: migrate subtrees to submodules`

- [ ] **Step 2: Verify commit**

```bash
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo log --oneline -1
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo show --stat HEAD | tail -5
```

Expected: commit message matches above; stat shows `.gitmodules` created and 13 submodule paths.

- [ ] **Step 3: Push to origin**

```bash
git -C /Users/yulianglu/projects/GitHub/siyuan-packages-monorepo push origin main
```

Expected: `main -> main` fast-forward push, no errors.

---

## Task 6: Post-migration smoke test

**Files:** read-only verification

- [ ] **Step 1: Simulate fresh clone experience**

```bash
cd /tmp
rm -rf siyuan-packages-monorepo-test
git clone https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo.git siyuan-packages-monorepo-test
cd siyuan-packages-monorepo-test
ls workspace/plugins/custom-block
```

Expected: `ls` shows an **empty directory** (submodule not yet initialized — this is correct behavior before `submodule update`).

- [ ] **Step 2: Initialize submodules**

```bash
cd /tmp/siyuan-packages-monorepo-test
git submodule update --init --recursive
ls workspace/plugins/custom-block
```

Expected: directory now contains plugin source files (e.g. `package.json`, `src/`).

- [ ] **Step 3: Clean up test clone**

```bash
rm -rf /tmp/siyuan-packages-monorepo-test
```

---

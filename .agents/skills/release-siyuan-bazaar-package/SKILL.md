---
name: release-siyuan-bazaar-package
description: Use when preparing a SiYuan Bazaar package release in siyuan-packages-monorepo, especially plugins or widgets with public/plugin.json, package.json, release-please-config.json, submodule commits, and monorepo submodule pointer commits.
---

# Release SiYuan Bazaar Package

## Overview

Release one SiYuan Bazaar package by synchronizing its version metadata, committing the package submodule, then committing the monorepo submodule pointer. Keep edits scoped to the requested package and preserve unrelated dirty worktree changes.

## Workflow

1. Ask for the exact target version unless the user already provided it.
   - Require a concrete SemVer value such as `2.0.2`.
   - Do not infer the version from changelogs, tags, or package state.
2. Inspect the package path and dirty state.
   - Example package: `workspace/plugins/custom-block`.
   - Run `git status --short` at the monorepo root and inside the package submodule.
   - If unrelated local changes exist, leave them alone.
3. Update exactly these release fields in the package submodule:
   - `public/plugin.json`: set top-level `version`.
   - `package.json`: set top-level `version`.
   - `release-please-config.json`: set `packages["."].release-as`.
4. Verify the three files parse as JSON and all three values equal the target version.
   - For metadata-only version bumps, package build is not required unless the user asks for it or the package's release docs require it.
   - Report verification as JSON parse/version consistency, or `N/A (metadata only)` for build/test.
5. Commit the submodule change first from inside the package directory.
   - Stage only the three version files unless the user requested more.
   - Suggested message: `chore(release): release v<version>`.
6. Commit the monorepo change from the repository root.
   - Stage only the package submodule path, for example `workspace/plugins/custom-block`.
   - Suggested message: `chore(submodule): bump custom-block to v<version>`.

## Custom Block Example

Use this shape for `custom-block`, replacing `<version>` with the user-approved value:

```bash
git status --short
git -C workspace/plugins/custom-block status --short

# Edit with a JSON-aware method, then verify:
node -e 'const fs=require("fs"); const v=process.argv[1]; const paths=["workspace/plugins/custom-block/public/plugin.json","workspace/plugins/custom-block/package.json","workspace/plugins/custom-block/release-please-config.json"]; const [plugin,pkg,rp]=paths.map((p)=>JSON.parse(fs.readFileSync(p,"utf8"))); const values=[plugin.version,pkg.version,rp.packages["."]["release-as"]]; if (values.some((x)=>x!==v)) { console.error(values); process.exit(1); } console.log(values.join("\\n"));' <version>

git -C workspace/plugins/custom-block add public/plugin.json package.json release-please-config.json
git -C workspace/plugins/custom-block commit -m "chore(release): release v<version>"

git add workspace/plugins/custom-block
git commit -m "chore(submodule): bump custom-block to v<version>"
```

If the inline Node verification is awkward because of shell quoting, use another structured JSON parser. Do not rely on plain text replacement as the only verification.

## Common Mistakes

- Do not update only `package.json`; Bazaar release metadata also uses `public/plugin.json`.
- Do not forget `release-please-config.json` `release-as`; release-please may otherwise propose a different release.
- Do not commit the monorepo pointer before the submodule commit exists.
- Do not stage unrelated source, generated output, or other package changes unless the user explicitly includes them in the release.

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
7. If the user only asked for the version bump, stop here. If the user asked to carry the release through CI (push, PR, merge, publish), continue with the post-release pipeline below.

## Post-Release Pipeline (push through publishing)

Each package repo (e.g. `custom-block`, `im-bot`) ships its own `.github/workflows/release-please.yml`, `build.yml`, and `release-distribution.yml`, and uses a `dev` → `main` branch flow independent of the monorepo's branches. Run these in order:

1. Push the package submodule's `dev` branch and the monorepo's `main` branch, in that order.
   - `git -C workspace/plugins/<name> push origin dev`
   - `git push origin main` (from the monorepo root)
   - The monorepo push must land **before** the release-please PR is merged (step 3), because the tag push in step 4 triggers `build.yml`, which checks out the **monorepo** recursively and builds whatever commit the monorepo's gitlink currently records. The gitlink must point at the version-bump commit on the package's `dev` branch (not a later commit), so push it as soon as it exists.
2. Open a PR in the package's own repo from `dev` to `main`:
   - `gh pr create --repo <owner>/<name> --base main --head dev --title "chore: release \`v<version>\`" --body ""`
   - Merge it: `gh pr merge <number> --repo <owner>/<name> --merge --delete-branch=false`.
3. The push to `main` triggers `release-please.yml`, which opens a `chore(main): release <version>` PR with the changelog/manifest. Poll with `gh pr list --repo <owner>/<name> --json number,title,headRefName` until it appears, then merge it the same way. Merging it creates the `v<version>` tag and a `v<version>` GitHub Release (marked prerelease by this repo's `release-please-config.json`).
4. The new tag triggers `build.yml` (builds the package, deploys dist output to the `publish` branch), which on completion triggers `release-distribution.yml` (packages the `publish` branch, creates a second release tagged `v<version>+<UTC+8 timestamp>` with the dist zip attached, also prerelease by default). Watch both with `gh run list --repo <owner>/<name> --workflow=<file> --limit 3` then `gh run watch <id> --repo <owner>/<name> --exit-status`.
5. Set the `v<version>+<timestamp>` release as the repo's latest release. GitHub rejects `--latest` on a release still flagged prerelease (`422 Latest release cannot be draft or prerelease`), so clear the flag in the same call:
   - `gh release edit "v<version>+<timestamp>" --repo <owner>/<name> --prerelease=false --latest`
   - Leave the plain `v<version>` release (from release-please) as prerelease; only the timestamped release becomes Latest.
6. Sync the package's local branches so `dev` is ready for the next feature commit:
   - `git -C workspace/plugins/<name> fetch origin main:main` (fast-forwards local `main` to the merged tip; safe even while `dev` is checked out since `main` isn't).
   - `git -C workspace/plugins/<name> rebase main dev` — `dev`'s commits are already ancestors of `main` after steps 2–3, so this is a fast-forward, not a history rewrite.
   - Update the monorepo's gitlink to this new tip and commit from the repository root with the repo's existing convention: `git add workspace/plugins/<name> && git commit -m "chore: update <name> subproject commit reference"`.
   - Push `dev` (`git -C workspace/plugins/<name> push origin dev`) only if the user also asked to push; otherwise leave the push for them to confirm.

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
- Do not push the monorepo's `main` after the release-please PR is merged; `build.yml` reads the monorepo's recorded submodule SHA at tag-push time, so the pointer must already be on `origin/main` before the tag exists.
- Do not point the monorepo's gitlink at the post-merge commit on the package's `main`; point it at the version-bump commit already pushed on `dev` (that commit is reachable and already carries the version files).
- Do not call `gh release edit --latest` on a release still marked prerelease; pair it with `--prerelease=false` in the same call or GitHub returns a 422.
- Shell working-directory state does not reliably persist between tool calls in this environment; prefer `git -C <path> ...` and `gh ... --repo <owner>/<name>` over a bare `cd` followed by a relative command.

# Git and PR Notes

## Change Hygiene

Check `git status --short` before editing. This repository often contains modified subprojects or submodule-like package directories; do not revert unrelated changes. Stage only files related to the task when the user asks for a commit.

## Commit Messages

Recent history follows Conventional Commit-style messages:

- `feat: add null return indication ...`
- `fix: update pnpm commands ...`
- `chore(subproject): update ... commit hash`
- `chore(submodule): update ... commit hash`

Use concise imperative subjects. Keep dependency, subproject hash, generated output, and feature changes separated when practical.

## Pull Requests

PR descriptions should include:

- affected packages;
- behavior or API changes;
- linked issues when available;
- verification commands and results;
- screenshots or recordings for visible UI changes;
- explicit notes for subproject, lockfile, or generated `dist/` updates.

## Git TODOs

- TODO: branch naming rules are not documented in this repository.
- TODO: release and changelog requirements for package changes are not documented beyond the existing `CHANGELOG.md`.

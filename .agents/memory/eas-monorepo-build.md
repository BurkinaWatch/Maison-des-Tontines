---
name: EAS monorepo APK builds
description: EAS Build setup for the Expo mobile app inside this monorepo.
---

EAS must receive an isolated mobile archive when the repository root contains workspace lockfiles or Replit-only package registry URLs. Keep EAS configuration in the mobile app, use an APK preview profile, and exclude root workspace state with `.easignore`.

**Why:** EAS can detect the parent npm workspace and run `npm ci` from the monorepo root. Replit-generated lockfile URLs then fail in the EAS builder before Expo config is read.

**How to apply:** Keep `eas.json` beside the mobile `app.json`, run EAS from `apps/mobile`, and ensure `.easignore` excludes root lockfiles, caches, backend packages, and workspace metadata while retaining `apps/mobile/package.json` and source files.

The EAS archive can include root-level generated APKs under `artifacts/`; explicitly exclude `/artifacts/` and inspect the archive before uploading. If the current Git HEAD has an empty commit message, EAS may reject the build metadata; use `EAS_NO_VCS=1` for that build instead of rewriting commit history.

**Why:** Root APKs unnecessarily inflated the EAS upload, and a Replit-created empty-message commit caused EAS to reject `gitCommitMessage`.

**How to apply:** Run `eas build:inspect --platform android --stage archive --profile preview` and verify the archive contains the mobile app but no prior APKs. Use `EAS_NO_VCS=1` only when the Git message is empty; it skips Git metadata while still building the local source archive.

The workspace `unzip` utility can report invalid extra-field warnings on valid EAS APKs; verify their ZIP entries with Python's standard-library `zipfile` before treating those warnings as a corrupt build.

**Why:** The Android APK passed Python ZIP integrity checks and was recognized as an Android package despite the local `unzip` warnings.

**How to apply:** Use `ZipFile(path).testzip()` as the integrity check for downloaded APKs in this environment.

EAS archive inspection can retain `.git` history in Git mode even when `.easignore` tries to exclude it. Verify excluded workspace files by checking for files, not just empty directories, and inspect the actual archive before building.

**Why:** The mobile archive correctly excluded backend files and root lockfiles, but retained Git metadata despite an ignore rule for `.git`.

**How to apply:** Keep EAS builds scoped to the mobile app, exclude backend data, artifacts, caches, and workspace files, and inspect the archive contents. Do not switch off VCS metadata solely to shrink an archive unless the documented empty-commit case applies.
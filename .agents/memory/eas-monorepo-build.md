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
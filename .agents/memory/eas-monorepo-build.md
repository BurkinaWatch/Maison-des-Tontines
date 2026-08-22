---
name: EAS monorepo APK builds
description: EAS Build setup for the Expo mobile app inside this monorepo.
---

EAS must receive an isolated mobile archive when the repository root contains workspace lockfiles or Replit-only package registry URLs. Keep EAS configuration in the mobile app, use an APK preview profile, and exclude root workspace state with `.easignore`.

**Why:** EAS can detect the parent npm workspace and run `npm ci` from the monorepo root. Replit-generated lockfile URLs then fail in the EAS builder before Expo config is read.

**How to apply:** Keep `eas.json` beside the mobile `app.json`, run EAS from `apps/mobile`, and ensure `.easignore` excludes root lockfiles, caches, backend packages, and workspace metadata while retaining `apps/mobile/package.json` and source files.
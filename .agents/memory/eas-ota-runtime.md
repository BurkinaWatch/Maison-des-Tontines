---
name: EAS OTA runtime matching
description: Compatibility rule for delivering Expo OTA updates to installed Android builds
---

An Expo OTA update is only eligible for an installed build when its runtime version matches the build’s embedded runtime version. With an app-version runtime policy, changing the app version requires a new native build before that runtime can receive updates.

**Why:** Publishing to the correct preview branch alone is not enough; a branch can still point to an older runtime and the installed APK will silently remain on its embedded bundle.

**How to apply:** Check the latest APK’s runtime and the branch’s current OTA runtime before publishing. Use OTA for JavaScript-only fixes when they match; rebuild when the installed APK has a different runtime or the change requires native code/configuration.
---
name: EAS OTA runtime matching
description: Compatibility rule for delivering Expo OTA updates to installed Android builds
---

An Expo OTA update is only eligible for an installed build when its runtime version matches the build’s embedded runtime version. Matching runtimes only establish eligibility: the update can still be stale if its source commit predates the fix or the installed build.

**Why:** Publishing to the correct branch and runtime is not enough. With `ON_LOAD`, an older same-runtime OTA can replace the newer JavaScript bundle embedded in an APK.

**How to apply:** Before publishing, compare the latest APK’s runtime and source commit with the branch’s current OTA runtime and source commit. Use OTA for JavaScript-only fixes when the runtime matches and its source includes the fix; rebuild when the runtime differs or native code/configuration changed.
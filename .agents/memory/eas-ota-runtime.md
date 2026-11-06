---
name: EAS OTA runtime matching
description: Compatibility rule for delivering Expo OTA updates to installed Android builds
---

An Expo OTA update is only eligible for an installed build when its runtime version matches the build’s embedded runtime version. Matching runtimes only establish eligibility: the update can still be stale if its source commit predates the fix or the installed build.

For this project, the EAS `preview` channel contains older updates with the same runtime as new APKs. The preview build profile must keep automatic update checks disabled so an old bundle cannot replace the current Expo Router app. Re-enable them only after the channel’s update is verified to include the current router entry and screens.

**Why:** Publishing to the correct branch and runtime is not enough. With `ON_LOAD`, an older same-runtime OTA can replace the newer JavaScript bundle embedded in an APK.

**How to apply:** Before publishing, compare the latest APK’s runtime and source commit with the branch’s current OTA runtime and source commit. Use OTA for JavaScript-only fixes when the runtime matches and its source includes the fix; rebuild when the runtime differs or native code/configuration changed. Keep automatic OTA checks disabled for preview APKs until the existing preview updates are replaced with a verified current bundle.
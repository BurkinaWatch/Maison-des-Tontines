---
name: Expo Router Android startup isolation
description: Expo Router route registration can fail before a screen renders in this SDK setup.
---

Treat the Android Expo Router navigator as an isolated startup risk in this SDK setup. Do not rely on a server-only `+api` route being excluded from its route context, and keep a direct native entry screen available until the router is validated on a device.

**Why:** The navigator can fail before a route renders with `Cannot read property 'ErrorBoundary' of undefined`. Removing a server-only API route alone did not eliminate the failure, so the safe recovery path is to bypass rendering the Expo Router `Stack` on Android startup.

**How to apply:** Keep server-side proxy handlers outside the native Expo Router route tree. For Android startup regressions, render a self-contained native screen that imports no router hooks or navigators, then re-enable route navigation only after on-device validation.
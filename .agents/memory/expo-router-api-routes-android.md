---
name: Expo Router API routes on Android
description: Server-only Expo Router API files can be registered as undefined Android routes in this SDK setup.
---

Do not place Expo Router `+api` route files beneath the mobile app route tree when building Android with this Expo Router setup.

**Why:** Metro can retain the route key while omitting its server-only implementation from the Android bundle. Expo Router then attempts to destructure `ErrorBoundary` from the undefined module during initial navigator setup, preventing the APK from opening.

**How to apply:** Keep server-side proxy handlers outside the native Expo Router route tree, or validate the generated Android route context after adding any `+api` route. The Android context should contain only renderable screen/layout modules.
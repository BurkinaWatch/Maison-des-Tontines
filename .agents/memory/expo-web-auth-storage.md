---
name: Expo web auth storage
description: Platform-specific session storage required by the Expo web preview.
---

Use browser localStorage for the Expo web preview and expo-secure-store only on native platforms.

**Why:** expo-secure-store’s web bundle can load without the native backing method and fail at runtime when writing a token.

**How to apply:** Keep token access behind a platform-aware storage adapter with the same keys on web and native, so auth behavior stays consistent across targets.
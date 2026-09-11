---
name: Playwright preview runtime
description: Browser smoke tests for this Expo preview need a system Chromium runtime on the Nix environment.
---

Use the system Chromium executable for Playwright preview checks instead of relying on the downloaded headless shell. The downloaded shell may lack shared libraries in the workspace, while the Nix Chromium package supplies a compatible runtime.

**Why:** The preview runs on NixOS and the Playwright browser bundle can fail to launch with missing `libgbm` and related libraries.

**How to apply:** Keep Chromium available in `.replit` and configure Playwright to resolve `chromium` from PATH, while targeting the existing Expo and API workflows.
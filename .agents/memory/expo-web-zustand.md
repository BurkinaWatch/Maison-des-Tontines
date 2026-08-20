---
name: Expo web Zustand compatibility
description: Explains the Metro web bundling constraint affecting Zustand in this Expo mobile workspace.
---

When building the Expo web app with Metro, import Zustand through its CommonJS entry (`zustand/index.js`) in application stores. Clear Metro’s cache after changing this resolution.

**Why:** Zustand’s ESM build contains `import.meta.env`, while the Expo Metro web development bundle is served as a classic script. Browsers then reject the bundle before React can render.

**How to apply:** If a future Expo web preview fails with `Cannot use 'import.meta' outside a module`, check that store imports continue to use the CommonJS entry and restart Metro with a cleared cache.
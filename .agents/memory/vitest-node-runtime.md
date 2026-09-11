---
name: Vitest Node runtime
description: Node runtime compatibility required by the API test toolchain.
---

The API test toolchain must run on Node 20 or newer; older Node releases can fail before tests start because modern Vitest dependencies import newer `node:util` exports.

**Why:** The project’s installed Vitest version rejected Node 18 during validation even though the API itself compiled successfully.

**How to apply:** Keep the Replit runtime aligned with Node 20+ before running API integration tests, and treat a startup failure in `node:util` as a runtime mismatch rather than an application test failure.
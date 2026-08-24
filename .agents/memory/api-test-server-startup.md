---
name: API test server startup
description: Keep Express integration tests isolated from the development HTTP listener.
---

Express integration tests should import the app without starting a listening server; reserve listener startup for non-test environments.

**Why:** Supertest can exercise the app directly, and starting a second listener causes port conflicts and unhandled test errors when the API workflow is already running.

**How to apply:** Guard the application bootstrap with the test environment check while leaving the exported app available to Supertest.
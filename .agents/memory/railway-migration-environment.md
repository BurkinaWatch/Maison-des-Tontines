---
name: Railway migration environment
description: Safeguard for projects where a Railway PostgreSQL URL is available during local development.
---

PostgreSQL migration commands must run only when explicitly in production, even if a Railway database URL is available in the local environment.

**Why:** A local development workspace can expose a Railway URL for integration testing. An ungated migration command could mutate the remote database during a routine local validation. The user also explicitly requires production data to remain unchanged unless migrations are authorized.

**How to apply:** Keep local preview commands on SQLite. Gate the production migration entrypoint on `NODE_ENV=production`. In this project, keep migrations manual and do not re-enable automatic production migrations without explicit authorization.
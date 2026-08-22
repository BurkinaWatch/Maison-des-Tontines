---
name: Railway migration environment
description: Safeguard for projects where a Railway PostgreSQL URL is available during local development.
---

PostgreSQL migration commands must run only when explicitly in production, even if a Railway database URL is available in the local environment.

**Why:** A local development workspace can expose a Railway URL for integration testing. An ungated migration command could mutate the remote database during a routine local validation.

**How to apply:** Keep local preview commands on SQLite. Gate the production migration entrypoint on `NODE_ENV=production`, and have the Railway start command set that environment before applying migrations.
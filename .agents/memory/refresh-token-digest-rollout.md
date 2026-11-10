---
name: Refresh-token digest rollout
description: How refresh JWT digests stay compatible with existing SQLite and PostgreSQL databases and sessions.
---

Store newly issued refresh JWTs as `sha256:`-prefixed SHA-256 digests. Keep the Prisma property `tokenHash` mapped to the physical `token` column in both database schemas. The auth service accepts legacy raw rows and hashes them on their first valid refresh; a guarded bulk script can rehash any remaining rows after the compatibility release is deployed.

**Why:** The project uses local SQLite and production PostgreSQL. Renaming the physical column would require a schema migration, while an immediate digest-only cutover would force all existing sessions to sign in again. A compatibility rollout avoids both.

**How to apply:** Keep both provider schemas aligned, use the shared digest helper for persistence and lookup, and retain legacy-row support until the bulk migration is approved and run. Never execute that migration against production without explicit approval and a backup.

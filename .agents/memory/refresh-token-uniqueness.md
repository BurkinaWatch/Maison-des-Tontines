---
name: Refresh-token uniqueness
description: Why refresh JWTs need a per-session unique identifier before storage.
---

Every refresh token must include per-session unique entropy in addition to the user and token type claims.

**Why:** JWT signatures are deterministic for the same payload, key, and timestamp. Two sessions issued in the same second can otherwise produce the identical token and violate a unique token store.

**How to apply:** Add a unique identifier whenever creating a refresh-token payload, and retain the uniqueness constraint in persistent session storage.
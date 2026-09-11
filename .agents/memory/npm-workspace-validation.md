---
name: Root validation command
description: Root checks should invoke workspace scripts through npm when pnpm version bootstrapping is unavailable.
---

Use npm workspace script delegation for lightweight root validation commands when the environment’s pnpm shim may try to install a different package-manager version.

**Why:** Turbo and pnpm recursive execution can fail before running the actual check when the declared pnpm version is not locally available or worker resources are constrained.

**How to apply:** Prefer a root script that delegates directly to the target workspace’s existing npm script when the validation scope is intentionally one workspace.
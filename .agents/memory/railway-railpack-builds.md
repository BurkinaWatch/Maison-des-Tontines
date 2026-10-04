---
name: Railway Railpack builds
description: Avoid Railway build failures from mismatched Node and package-manager metadata in a workspace.
---

Keep the root Node engine constraint high enough for both workspace dependencies and build tooling. Keep `packageManager` aligned with the root build and start commands; do not declare npm while invoking pnpm through Corepack.

**Why:** Railpack used the root `engines.node` value to select Node 18, although current dependencies and Corepack required newer Node. It also honored the root npm `packageManager` declaration and rejected a build command that invoked pnpm.

**How to apply:** Check the Railpack detection/build log for the selected Node version and package manager. Use matching root scripts and metadata, then verify the root build locally before triggering a Railway redeploy.
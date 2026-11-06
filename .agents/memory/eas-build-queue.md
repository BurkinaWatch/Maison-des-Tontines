---
name: EAS build queue delays
description: Handling unusually long EAS Android build queues without creating duplicate builds.
---

An EAS Android build can remain `IN_QUEUE` for more than 20 minutes before starting, then complete successfully. A waiting `eas build --wait` process is not evidence of a stuck build.

**Why:** A successful Android build in this workspace stayed queued for about 21 minutes before moving to `IN_PROGRESS`; earlier builds also showed substantial queue time.

**How to apply:** Keep the existing build running and check its ID with `eas build:view <build-id>` at reasonable intervals. Do not submit a duplicate or switch to local compilation unless the local Android toolchain is confirmed and the queued build is intentionally canceled.

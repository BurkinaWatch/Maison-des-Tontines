---
name: Railway deployment branch isolation
description: Avoid including unrelated workspace-only commits when deploying a Railway Git-connected service.
---

When Railway deploys from a GitHub branch that is behind the Replit workspace branch, do not push the workspace branch wholesale for a narrow production fix. Build an isolated commit on the current remote production branch containing only the intended patch, then push without force.

**Why:** The workspace can contain unrelated local commits that would otherwise be deployed to production together with the fix.

**How to apply:** Confirm the Railway source branch and live commit, compare them with the remote branch, isolate the required changes from that remote base, and verify the deployment plus a public health check. Leave unrelated workspace changes untouched.

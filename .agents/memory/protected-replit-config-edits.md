---
name: Protected Replit configuration edits
description: Safe workflow for updating protected .replit configuration and validating port mappings
---

Direct edits to `.replit` may be rejected. Stage the complete updated TOML in a temporary workspace file, then use Replit's configuration replacement helper. Verify the persisted file and public route; a successful helper response alone was not enough to confirm the intended port mapping.

**Why:** A direct edit was rejected, and the first replacement attempt did not agree with the immediately observed file and external route.

**How to apply:** For `.replit` changes, use the replacement helper, re-read the saved file with `ReadFile`, restart the relevant workflow, and verify the external URL and rendered app.
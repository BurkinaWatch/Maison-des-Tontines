---
name: Expo preview API routing
description: How the Expo web preview should reach the companion API service.
---

Use Expo’s server middleware to proxy preview `/api` requests to the companion API, and have web clients use their current origin as the API base URL.

**Why:** A second API workflow port can be healthy inside the workspace while remaining unavailable from the browser-facing preview domain. A same-origin route avoids unreliable multi-port browser access and cross-origin restrictions.

**How to apply:** Keep the backend workflow separate for its lifecycle and internal port, but route browser-facing API requests through the Expo preview server. Do not forward externally supplied `X-Forwarded-*` headers through that internal proxy, because Express rate limiting treats them as an untrusted proxy configuration.
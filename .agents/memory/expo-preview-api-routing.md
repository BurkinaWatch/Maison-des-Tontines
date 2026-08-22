---
name: Expo preview API routing
description: How the Expo web preview should reach the companion API service.
---

Use an Expo Router catch-all API route to proxy preview `/api` requests to the companion API, and have web clients use their current origin as the API base URL.

**Why:** A second API workflow port can be healthy inside the workspace while remaining unavailable from the browser-facing preview domain. Metro’s middleware hook did not intercept Expo web API requests in this setup, while an Expo server route does. A same-origin route avoids unreliable multi-port browser access and cross-origin restrictions.

**How to apply:** Keep the backend workflow separate for its lifecycle and internal port, but route browser-facing API requests through an Expo Router `+api.ts` server route. Configure Expo web output for `server`. Do not forward externally supplied `X-Forwarded-*` headers through that internal proxy, because Express rate limiting treats them as an untrusted proxy configuration.
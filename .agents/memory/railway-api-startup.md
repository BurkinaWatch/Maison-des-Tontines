---
name: Railway API startup prerequisites
description: Production Railway requirements for the API listener and BullMQ workers.
---

Before enabling BullMQ workers in production, ensure a Redis service is live in the same Railway environment and the API's Redis host, port, and password use private Railway variable references. The API starts workers before opening its HTTP listener, so missing Redis can prevent the entire API from serving requests. Keep the API `PORT` aligned with the public domain's target port.

**Why:** Production initially had no Redis service, while the API started BullMQ by default; the domain also routed to a different port than the API's code default. The temporary worker disable restored login, and adding Redis plus aligning the port restored worker startup without changing database data.

**How to apply:** Inspect the Railway environment and domain target before deployment. Provision Redis first, then set the API's Redis references and enable workers. Never copy Redis credentials into code or chat. Do not run production database migrations as part of this recovery.
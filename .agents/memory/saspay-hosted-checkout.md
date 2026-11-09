---
name: SasPay hosted checkout
description: Payment flow choice and activation safeguards for SasPay in this app.
---

Use SasPay hosted checkout sessions for the first mobile-money contribution flow. It lets members choose their country and network on SasPay's page and avoids hardcoded operator catalogs and OTP-specific UI. The user stated that SasPay has no test account.

**Why:** The app cannot validate country/network availability against a sandbox, and SasPay's hosted checkout supports member self-selection without assuming operator capabilities.

**How to apply:** Keep the provider default set to `mock`. Do not enable or deploy live payment processing until a live API key is configured securely and production activation is explicitly approved. Verify payment status server-side and compare amount and currency before marking a contribution paid.

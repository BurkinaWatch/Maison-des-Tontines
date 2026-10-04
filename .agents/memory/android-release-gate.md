---
name: Android release gate
description: Prevent repeated APK deliveries before production authentication is verified.
---

Do not start another Android APK build until the actual production login flow has been verified end to end against the database intended for release. A healthy endpoint, valid APK archive, or embedded API URL is not proof that authentication works.

**Why:** The user explicitly said not to publish builds in a loop and to deliver only after the build is confirmed to work; earlier APK checks did not catch a real login failure.

**How to apply:** For Android login incidents, first establish which production database the API uses and whether the account is present. Do not request the user's password or alter production user data without explicit authorization. If end-to-end authentication cannot be verified safely, block a new build and state what evidence is missing.
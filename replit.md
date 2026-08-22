# Maison des Tontines on Replit

## Run the mobile web preview

The `Start application` workflow runs the Expo mobile app as a web preview:

```sh
CI=1 npm exec --workspace=maison-des-tontines-mobile expo start -- --web --port 5000 --clear
```

The mobile workspace uses Expo SDK 54 and is available in the Replit preview on port 5000.

## Backend preview

The `Project` workflow starts the Expo web preview and the Express API together. The API listens on port 4000, uses the checked-in SQLite development database for preview data, and receives preview requests through the Expo server’s `/api` proxy. Background BullMQ workers are disabled in the preview because Redis is not required for account verification.

The preview supplies JWT signing values from the existing `SESSION_SECRET`; production deployments must provide distinct `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values.

## Verification emails

User authentication is handled locally with an email address and a bcrypt-hashed password. No e-mail delivery provider is required for registration or sign-in.
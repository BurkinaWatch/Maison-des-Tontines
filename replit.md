# Maison des Tontines on Replit

## Run the mobile web preview

The `Start application` workflow runs the Expo mobile app as a web preview:

```sh
CI=1 npm exec --workspace=maison-des-tontines-mobile expo start -- --web --port 5000 --clear
```

The mobile workspace uses Expo SDK 54 and is available in the Replit preview on port 5000.

## Backend status

The Express API is not included in the preview workflow. Before starting it, configure the required `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` secrets and a Redis service for BullMQ workers. The API uses the checked-in SQLite development database by default.
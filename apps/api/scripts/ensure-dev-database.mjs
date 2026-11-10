import "dotenv/config";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedDatabaseUrl = /^file:\.\/dev\.db(?:\?.*)?$/;

export function ensureDevelopmentDatabase({
  nodeEnv = process.env.NODE_ENV,
  databaseUrl = process.env.DATABASE_URL,
  databasePath = resolve(apiRoot, "prisma/dev.db"),
  exists = existsSync,
  initializeSchema = (url = databaseUrl) => {
    execFileSync(
      "prisma",
      ["db", "push", "--skip-generate"],
      {
        cwd: apiRoot,
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: url },
      },
    );
  },
} = {}) {
  if (nodeEnv !== "development") {
    throw new Error("The local database setup can only run in development.");
  }

  if (!databaseUrl || !expectedDatabaseUrl.test(databaseUrl)) {
    throw new Error(
      "The local database setup only accepts DATABASE_URL=file:./dev.db; no other database will be initialized.",
    );
  }

  if (exists(databasePath)) {
    return { initialized: false };
  }

  mkdirSync(dirname(databasePath), { recursive: true });
  initializeSchema(databaseUrl);

  if (!exists(databasePath)) {
    throw new Error("Prisma did not create the expected local SQLite database.");
  }

  return { initialized: true };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = ensureDevelopmentDatabase();
    console.log(
      result.initialized
        ? "Created an empty local SQLite database from the Prisma schema."
        : "Kept the existing local SQLite database unchanged.",
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Local database setup failed.");
    process.exitCode = 1;
  }
}

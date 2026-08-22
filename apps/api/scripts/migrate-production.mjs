import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL ?? process.env.RAILWAY_DATABASE_URL ?? "";

if (process.env.NODE_ENV !== "production") {
  console.log("PostgreSQL migrations skipped outside production.");
  process.exit(0);
}

if (!/^(postgres|postgresql):\/\//.test(databaseUrl)) {
  console.log("PostgreSQL migrations skipped; using the local SQLite database.");
  process.exit(0);
}

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = resolve(apiRoot, "prisma/postgresql/schema.prisma");
const generatorScript = resolve(apiRoot, "scripts/generate-postgres-client.mjs");

execFileSync(process.execPath, [generatorScript], {
  cwd: apiRoot,
  stdio: "inherit",
});

execFileSync("prisma", ["migrate", "deploy", "--schema", schemaPath], {
  cwd: apiRoot,
  stdio: "inherit",
});
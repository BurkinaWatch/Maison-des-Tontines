import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceSchemaPath = resolve(apiRoot, "prisma/schema.prisma");
const postgresSchemaPath = resolve(apiRoot, "prisma/postgresql/schema.prisma");
const sourceSchema = await readFile(sourceSchemaPath, "utf8");

const postgresSchema = sourceSchema
  .replace(
    'provider = "prisma-client-js"',
    'provider = "prisma-client-js"\n  output   = "../../generated/prisma/postgresql"',
  )
  .replace('provider = "sqlite"', 'provider = "postgresql"');

await mkdir(dirname(postgresSchemaPath), { recursive: true });
await writeFile(postgresSchemaPath, postgresSchema);

execFileSync("prisma", ["generate", "--schema", postgresSchemaPath], {
  cwd: apiRoot,
  stdio: "inherit",
});
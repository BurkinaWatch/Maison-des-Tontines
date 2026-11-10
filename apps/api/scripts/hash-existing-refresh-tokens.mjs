import "dotenv/config";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const databaseUrl = process.env.DATABASE_URL ?? process.env.RAILWAY_DATABASE_URL;

function hashRefreshToken(token) {
  return `sha256:${createHash("sha256").update(token, "utf8").digest("hex")}`;
}

function isHashedRefreshToken(token) {
  return /^sha256:[a-f0-9]{64}$/.test(token);
}

async function main() {
  if (!process.argv.includes("--confirm")) {
    throw new Error(
      "This migration changes stored refresh-token values. Deploy the compatibility release first, back up the selected database, then re-run with --confirm.",
    );
  }

  if (!databaseUrl) {
    throw new Error("Set DATABASE_URL for the database to migrate.");
  }

  const isPostgres = /^(postgres|postgresql):\/\//.test(databaseUrl);
  const clientModule = isPostgres
    ? require("../generated/prisma/postgresql/index.js")
    : require("@prisma/client");
  const prisma = new clientModule.PrismaClient();

  try {
    const rows = await prisma.refreshToken.findMany({
      select: { id: true, tokenHash: true },
    });
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      if (isHashedRefreshToken(row.tokenHash)) {
        skipped += 1;
        continue;
      }

      const result = await prisma.refreshToken.updateMany({
        where: { id: row.id, tokenHash: row.tokenHash },
        data: { tokenHash: hashRefreshToken(row.tokenHash) },
      });
      updated += result.count;
    }

    console.log(
      `Refresh-token migration complete: ${updated} updated, ${skipped} already hashed.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Refresh-token migration failed.");
  process.exitCode = 1;
});

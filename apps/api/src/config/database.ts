import { createRequire } from "node:module";
import { Prisma, PrismaClient } from "@prisma/client";
import { getEnv } from "./env.js";

let prisma: PrismaClient;
const require = createRequire(import.meta.url);

const prismaOptions: Prisma.PrismaClientOptions = {
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "event" },
    { level: "warn", emit: "event" },
  ],
};

export function getPrisma(): PrismaClient {
  if (!prisma) {
    const databaseUrl = getEnv().DATABASE_URL;
    const isPostgres = /^(postgres|postgresql):\/\//.test(databaseUrl);

    if (isPostgres) {
      try {
        const { PrismaClient: PostgresPrismaClient } = require(
          "../../generated/prisma/postgresql/index.js",
        );
        prisma = new PostgresPrismaClient(prismaOptions) as PrismaClient;
      } catch (error) {
        throw new Error(
          "The PostgreSQL Prisma client is unavailable. Run prisma:generate:postgres before starting the API.",
          { cause: error },
        );
      }
    } else {
      prisma = new PrismaClient(prismaOptions);
    }
  }
  return prisma;
}

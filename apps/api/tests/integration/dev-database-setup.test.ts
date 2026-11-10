import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureDevelopmentDatabase } from "../../scripts/ensure-dev-database.mjs";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("first-run development database", () => {
  it("creates a usable SQLite database in isolation and preserves it on the next run", async () => {
    const directory = mkdtempSync(join(tmpdir(), "tontine-dev-db-"));
    temporaryDirectories.push(directory);
    const databasePath = join(directory, "dev.db");
    const isolatedDatabaseUrl = `file:${databasePath}`;
    const initializeSchema = vi.fn(() => {
      execFileSync(
        "prisma",
        ["db", "push", "--skip-generate"],
        {
          cwd: process.cwd(),
          stdio: "pipe",
          env: { ...process.env, DATABASE_URL: isolatedDatabaseUrl },
        },
      );
    });

    const firstRun = ensureDevelopmentDatabase({
      nodeEnv: "development",
      databaseUrl: "file:./dev.db",
      databasePath,
      exists: existsSync,
      initializeSchema,
    });

    expect(firstRun).toEqual({ initialized: true });
    expect(existsSync(databasePath)).toBe(true);

    const prisma = new PrismaClient({
      datasources: { db: { url: isolatedDatabaseUrl } },
    });
    try {
      expect(await prisma.user.count()).toBe(0);
    } finally {
      await prisma.$disconnect();
    }

    const secondRun = ensureDevelopmentDatabase({
      nodeEnv: "development",
      databaseUrl: "file:./dev.db",
      databasePath,
      exists: existsSync,
      initializeSchema,
    });

    expect(secondRun).toEqual({ initialized: false });
    expect(initializeSchema).toHaveBeenCalledOnce();
  }, 30_000);
});

import { describe, expect, it, vi } from "vitest";
import { ensureDevelopmentDatabase } from "../../scripts/ensure-dev-database.mjs";

describe("development SQLite setup", () => {
  it("leaves an existing local database untouched", () => {
    const initializeSchema = vi.fn();

    const result = ensureDevelopmentDatabase({
      nodeEnv: "development",
      databaseUrl: "file:./dev.db",
      exists: () => true,
      initializeSchema,
    });

    expect(result).toEqual({ initialized: false });
    expect(initializeSchema).not.toHaveBeenCalled();
  });

  it("creates the schema only for a missing local database", () => {
    let exists = false;
    const initializeSchema = vi.fn(() => {
      exists = true;
    });

    const result = ensureDevelopmentDatabase({
      nodeEnv: "development",
      databaseUrl: "file:./dev.db",
      exists: () => exists,
      initializeSchema,
    });

    expect(result).toEqual({ initialized: true });
    expect(initializeSchema).toHaveBeenCalledOnce();
  });

  it("refuses production and non-local database URLs", () => {
    const initializeSchema = vi.fn();

    expect(() =>
      ensureDevelopmentDatabase({
        nodeEnv: "production",
        databaseUrl: "file:./dev.db",
        exists: () => false,
        initializeSchema,
      }),
    ).toThrow("only run in development");

    expect(() =>
      ensureDevelopmentDatabase({
        nodeEnv: "development",
        databaseUrl: "postgresql://remote.invalid/db",
        exists: () => false,
        initializeSchema,
      }),
    ).toThrow("only accepts DATABASE_URL=file:./dev.db");
    expect(initializeSchema).not.toHaveBeenCalled();
  });
});

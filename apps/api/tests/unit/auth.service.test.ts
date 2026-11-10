import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

const mocks = vi.hoisted(() => ({
  refreshFindFirst: vi.fn(),
  refreshUpdate: vi.fn(),
  refreshUpdateMany: vi.fn(),
  refreshCreate: vi.fn(),
  userFindUnique: vi.fn(),
  refreshSecret: "test-refresh-secret-that-is-long-enough",
}));

vi.mock("../../src/config/database.js", () => ({
  getPrisma: () => ({
    refreshToken: {
      findFirst: mocks.refreshFindFirst,
      update: mocks.refreshUpdate,
      updateMany: mocks.refreshUpdateMany,
      create: mocks.refreshCreate,
    },
    user: {
      findUnique: mocks.userFindUnique,
    },
  }),
}));

vi.mock("../../src/config/env.js", () => ({
  getEnv: () => ({
    JWT_ACCESS_SECRET: "test-access-secret-that-is-long-enough",
    JWT_REFRESH_SECRET: mocks.refreshSecret,
    JWT_ACCESS_EXPIRY: "15m",
    JWT_REFRESH_EXPIRY: "7d",
  }),
}));

vi.mock("../../src/config/logger.js", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { AuthService } from "../../src/modules/auth/auth.service.js";
import { hashRefreshToken } from "../../src/modules/auth/refresh-token.js";

function makeRefreshToken() {
  return jwt.sign(
    { sub: "user-1", type: "refresh", jti: "unique-session-test" },
    mocks.refreshSecret,
    { expiresIn: "1h" },
  );
}

function makeUser() {
  return {
    id: "user-1",
    phone: "+22670000000",
    email: "member@example.test",
    name: "Test Member",
    role: "MEMBER",
    status: "ACTIVE",
  };
}

describe("AuthService refresh-token persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refreshUpdate.mockResolvedValue({});
    mocks.refreshUpdateMany.mockResolvedValue({ count: 1 });
    mocks.refreshCreate.mockResolvedValue({});
    mocks.userFindUnique.mockResolvedValue(makeUser());
  });

  it("looks up hashed tokens and stores the rotated token as a digest", async () => {
    const oldToken = makeRefreshToken();
    mocks.refreshFindFirst.mockResolvedValueOnce({ id: "stored-1" });

    const result = await new AuthService().refreshToken(oldToken);

    expect(mocks.refreshFindFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        tokenHash: hashRefreshToken(oldToken),
        userId: "user-1",
      }),
    });
    expect(mocks.refreshUpdate).toHaveBeenCalledWith({
      where: { id: "stored-1" },
      data: { revokedAt: expect.any(Date) },
    });
    expect(result.refreshToken).toBeTruthy();
    expect(mocks.refreshCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        tokenHash: hashRefreshToken(result.refreshToken),
        expiresAt: expect.any(Date),
      }),
    });
    expect(mocks.refreshCreate.mock.calls[0][0].data.tokenHash).not.toBe(
      result.refreshToken,
    );
  });

  it("migrates a legacy raw token on its first successful refresh", async () => {
    const legacyToken = makeRefreshToken();
    mocks.refreshFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "legacy-1" });

    await new AuthService().refreshToken(legacyToken);

    expect(mocks.refreshUpdateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: "legacy-1",
        tokenHash: legacyToken,
        revokedAt: null,
      }),
      data: { tokenHash: hashRefreshToken(legacyToken) },
    });
    expect(mocks.refreshUpdate).toHaveBeenCalledWith({
      where: { id: "legacy-1" },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it.each(["expired", "revoked", "missing"] as const)(
    "rejects %s tokens without issuing a replacement",
    async () => {
      const token = makeRefreshToken();
      mocks.refreshFindFirst.mockResolvedValue(null);

      await expect(new AuthService().refreshToken(token)).rejects.toMatchObject({
        statusCode: 401,
      });
      expect(mocks.refreshCreate).not.toHaveBeenCalled();
    },
  );

  it("matches both hashed and legacy token forms during logout", async () => {
    const token = makeRefreshToken();

    await new AuthService().logout("user-1", token);

    expect(mocks.refreshUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        tokenHash: { in: [hashRefreshToken(token), token] },
        revokedAt: null,
      },
      data: { revokedAt: expect.any(Date) },
    });
  });
});

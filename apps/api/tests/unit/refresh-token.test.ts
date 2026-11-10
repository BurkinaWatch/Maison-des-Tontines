import { describe, expect, it } from "vitest";
import { hashRefreshToken, isHashedRefreshToken } from "../../src/modules/auth/refresh-token.js";

describe("refresh-token hashing", () => {
  it("stores a deterministic one-way digest instead of the supplied token", () => {
    const token = "refresh-token-for-test-only";
    const digest = hashRefreshToken(token);

    expect(digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(digest).not.toContain(token);
    expect(hashRefreshToken(token)).toBe(digest);
    expect(isHashedRefreshToken(digest)).toBe(true);
  });

  it("produces different digests for different tokens", () => {
    expect(hashRefreshToken("first-test-token")).not.toBe(
      hashRefreshToken("second-test-token"),
    );
    expect(isHashedRefreshToken("plain-token")).toBe(false);
  });
});

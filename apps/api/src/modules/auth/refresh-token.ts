import { createHash } from "node:crypto";

const TOKEN_HASH_PREFIX = "sha256:";

export function hashRefreshToken(token: string): string {
  return `${TOKEN_HASH_PREFIX}${createHash("sha256").update(token, "utf8").digest("hex")}`;
}

export function isHashedRefreshToken(token: string): boolean {
  return /^sha256:[a-f0-9]{64}$/.test(token);
}

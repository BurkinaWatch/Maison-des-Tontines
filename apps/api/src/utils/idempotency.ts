import { nanoid } from "nanoid";

export function generateIdempotencyKey(prefix: string, data: any): string {
  const payload = JSON.stringify({ prefix, data });
  return `${prefix}_${nanoid(32)}`;
}

export function isIdempotencyKeyValid(key: string): boolean {
  return key.length >= 10 && key.length <= 100;
}

import { nanoid } from "nanoid";
export function generateIdempotencyKey(prefix, data) {
    const payload = JSON.stringify({ prefix, data });
    return `${prefix}_${nanoid(32)}`;
}
export function isIdempotencyKeyValid(key) {
    return key.length >= 10 && key.length <= 100;
}
//# sourceMappingURL=idempotency.js.map
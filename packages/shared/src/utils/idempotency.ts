const IDEMPOTENCY_KEY_TTL_MS = 24 * 60 * 60 * 1000;

const store = new Map<string, { value: unknown; expiresAt: number }>();

export const generateIdempotencyKey = (prefix: string, payload: unknown): string => {
  const data = JSON.stringify({ prefix, payload });
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `idem_${prefix}_${Math.abs(hash)}_${Date.now()}`;
};

export const validateIdempotencyKey = (key: string): boolean => {
  return typeof key === 'string' && key.length > 0 && key.startsWith('idem_');
};

export const getCachedIdempotencyResult = (key: string): unknown | null => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

export const setCachedIdempotencyResult = (key: string, value: unknown): void => {
  store.set(key, {
    value,
    expiresAt: Date.now() + IDEMPOTENCY_KEY_TTL_MS,
  });
};

export const clearIdempotencyStore = (): void => {
  store.clear();
};

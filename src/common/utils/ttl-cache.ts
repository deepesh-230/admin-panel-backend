/** Simple in-process TTL cache. Safe for warm Node / Vercel instances. */

type Entry<T> = { value: T; expiresAt: number };

export class TtlCache {
  private store = new Map<string, Entry<unknown>>();

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string) {
    this.store.delete(key);
  }

  deletePrefix(prefix: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear() {
    this.store.clear();
  }
}

export const catalogCache = new TtlCache();
export const placesCache = new TtlCache();
export const authCache = new TtlCache();

export const CATALOG_TTL_MS = 90_000;
export const STATES_TTL_MS = 10 * 60_000;
export const PLACES_TTL_MS = 45_000;
export const AUTH_TTL_MS = 45_000;

export function invalidateCatalogCache() {
  catalogCache.deletePrefix('categories:');
  catalogCache.deletePrefix('subcategories:');
}

export function invalidateAuthCache(userId?: string) {
  if (userId) {
    authCache.delete(`auth:${userId}`);
    return;
  }
  authCache.deletePrefix('auth:');
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlMs };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full, ignore
  }
}

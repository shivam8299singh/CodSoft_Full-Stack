// In-memory cache with TTL fallback for fast response and optional Redis compatibility
class CacheService {
  constructor() {
    this.memoryStore = new Map();
  }

  get(key) {
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 60) {
    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key) {
    this.memoryStore.delete(key);
  }

  delByPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.memoryStore.keys()) {
      if (regex.test(key)) {
        this.memoryStore.delete(key);
      }
    }
  }

  clear() {
    this.memoryStore.clear();
  }
}

export const cache = new CacheService();
export default cache;

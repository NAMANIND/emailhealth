// Simple in-memory cache for development
// In production, you'd want to use Redis or another distributed cache
const cacheStore = new Map<string, string>();

export const cache = {
  async get(key: string): Promise<string | null> {
    return cacheStore.get(key) || null;
  },

  async set(key: string, value: string, ttl?: number): Promise<void> {
    cacheStore.set(key, value);
    if (ttl) {
      setTimeout(() => {
        cacheStore.delete(key);
      }, ttl * 1000);
    }
  },

  async forget(key: string): Promise<void> {
    cacheStore.delete(key);
  },
};

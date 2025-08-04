// lib/api-cache.ts
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = {
  provinces: 3600000, // 1 hour
  stats: 300000,      // 5 minutes
  activities: 60000,  // 1 minute
};

export function getCachedData<T>(key: string, ttl: number): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
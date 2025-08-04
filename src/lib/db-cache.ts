// lib/db-cache.ts
import { supabase } from './supabase-client';

const queryCache = new Map();

export async function cachedQuery(query: string, params: any[] = []) {
  const cacheKey = `${query}-${JSON.stringify(params)}`;
  
  if (queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 300000) { // 5 menit
      return cached.data;
    }
  }
  
  const { data, error } = await supabase.rpc(query, params);
  
  if (!error) {
    queryCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }
  
  return { data, error };
}
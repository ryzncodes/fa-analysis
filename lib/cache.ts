import fs from 'fs';
import path from 'path';

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const CACHE_DIR = path.join(process.cwd(), '.cache');
const TTL = {
  NEWS: 60 * 60 * 1000, // 1 hour in milliseconds
  FUNDAMENTAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export async function getCachedData<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);

  try {
    // Check if cache exists and is valid
    if (fs.existsSync(cacheFile)) {
      const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
      const cache: CacheEntry<T> = JSON.parse(cacheContent);
      
      // Check if cache is still valid
      if (Date.now() - cache.timestamp < ttl) {
        return cache.data;
      }
    }

    // Cache miss or expired, fetch new data
    const data = await fetchFn();
    
    // Save to cache
    const cacheEntry: CacheEntry<T> = {
      timestamp: Date.now(),
      data,
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2));
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // On cache error, fetch fresh data
    return fetchFn();
  }
}

export const getCacheKey = (prefix: string, symbol: string): string => {
  return `${prefix}_${symbol}`.toLowerCase();
}; 
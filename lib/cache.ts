import fs from 'fs';
import path from 'path';
import { memoryCache } from './utils/inMemoryCache';

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const CACHE_DIR = path.join(process.cwd(), '.cache');
export const TTL = {
  NEWS: 60 * 60 * 1000, // 1 hour in milliseconds
  FUNDAMENTAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MARKET_DATA: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Generate a cache key based on the function and parameters
 */
export function getCacheKey(type: string, ...params: string[]): string {
  return `${type}_${params.join('_')}`;
}

/**
 * Get data from cache (memory or file) or fetch it if not available
 */
export async function getCachedData<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try memory cache first
  const memoryData = memoryCache.get<T>(key);
  if (memoryData !== undefined) {
    return memoryData;
  }

  const cacheFile = path.join(CACHE_DIR, `${key}.json`);

  try {
    // Check if file cache exists and is valid
    if (fs.existsSync(cacheFile)) {
      const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
      const cache: CacheEntry<T> = JSON.parse(cacheContent);
      
      // Check if cache is still valid
      if (Date.now() - cache.timestamp < ttl) {
        // Store in memory cache for faster subsequent access
        memoryCache.set(key, cache.data, ttl);
        return cache.data;
      }
    }

    // Cache miss or expired, fetch new data
    const data = await fetchFn();
    
    // Save to both caches
    const cacheEntry: CacheEntry<T> = {
      timestamp: Date.now(),
      data,
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2));
    memoryCache.set(key, data, ttl);
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // On cache error, fetch fresh data
    return fetchFn();
  }
}

/**
 * Invalidate cache for a specific key
 */
export function invalidateCache(key: string): void {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  
  // Remove from memory cache
  memoryCache.invalidate(key);
  
  // Remove from file cache
  if (fs.existsSync(cacheFile)) {
    try {
      fs.unlinkSync(cacheFile);
    } catch (error) {
      console.error('Error removing cache file:', error);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memoryCache: memoryCache.getStats(),
    fileCache: {
      size: fs.readdirSync(CACHE_DIR).length,
    },
  };
} 
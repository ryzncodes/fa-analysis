// lib/utils/inMemoryCache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private stats: {
    hits: number;
    misses: number;
    invalidations: number;
  };

  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      invalidations: 0,
    };
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns The cached value or undefined if not found/expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.invalidate(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   */
  set<T>(key: string, value: T, ttl: number): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Remove an entry from the cache
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.stats.invalidations++;
    }
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.invalidations += this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.invalidate(key);
      }
    });
  }
}

// Create a singleton instance
export const memoryCache = new InMemoryCache();

// Run cleanup every minute
setInterval(() => memoryCache.cleanup(), 60 * 1000); 
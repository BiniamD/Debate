import { Redis } from '@upstash/redis';
import type { MultiDebateResponse } from '@shared/schema';

// Use Upstash Redis for serverless caching
// Falls back to in-memory if not configured
let redis: Redis | null = null;

// In-memory fallback for development
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

export function initCache() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('✓ Redis cache initialized (Upstash)');
  } else {
    console.warn('⚠ Redis not configured, using in-memory cache (dev only)');
  }
}

export interface CachedAnalysis {
  result: MultiDebateResponse;
  symbols: string[];
  cachedAt: string;
  expiresAt: string;
}

/**
 * Get cached analysis for a symbol
 * @param symbol Stock symbol (e.g., "AAPL")
 * @returns Cached analysis or null
 */
export async function getCachedAnalysis(symbol: string): Promise<CachedAnalysis | null> {
  const key = `analysis:${symbol.toUpperCase()}`;

  try {
    if (redis) {
      const cached = await redis.get<CachedAnalysis>(key);
      if (cached && new Date(cached.expiresAt) > new Date()) {
        return cached;
      }
      return null;
    } else {
      // In-memory fallback
      const cached = memoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
      return null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Cache analysis for a symbol
 * @param symbol Stock symbol
 * @param result Analysis result
 * @param ttlSeconds Time to live in seconds (default: 24 hours)
 */
export async function setCachedAnalysis(
  symbol: string,
  result: MultiDebateResponse,
  ttlSeconds: number = 86400 // 24 hours
): Promise<void> {
  const key = `analysis:${symbol.toUpperCase()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  const cached: CachedAnalysis = {
    result,
    symbols: [symbol],
    cachedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  try {
    if (redis) {
      await redis.set(key, cached, { ex: ttlSeconds });
    } else {
      // In-memory fallback
      memoryCache.set(key, {
        data: cached,
        expiresAt: expiresAt.getTime(),
      });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Invalidate cached analysis for a symbol
 */
export async function invalidateCache(symbol: string): Promise<void> {
  const key = `analysis:${symbol.toUpperCase()}`;

  try {
    if (redis) {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache invalidate error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  keys: number;
  memoryUsage: string;
}> {
  try {
    if (redis) {
      const keys = await redis.dbsize();
      return {
        keys,
        memoryUsage: 'N/A (Upstash)',
      };
    } else {
      return {
        keys: memoryCache.size,
        memoryUsage: `${(memoryCache.size * 10).toFixed(2)} KB (estimated)`,
      };
    }
  } catch (error) {
    console.error('Cache stats error:', error);
    return { keys: 0, memoryUsage: 'Error' };
  }
}

/**
 * Cleanup expired entries (for in-memory cache)
 */
export function cleanupExpired(): void {
  if (!redis) {
    const now = Date.now();
    const entries = Array.from(memoryCache.entries());
    for (const [key, value] of entries) {
      if (value.expiresAt < now) {
        memoryCache.delete(key);
      }
    }
  }
}

// Run cleanup every hour for in-memory cache
setInterval(cleanupExpired, 3600000);

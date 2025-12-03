import { createHash } from 'crypto';
import type { ConversionResult } from './types.js';

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  result: ConversionResult;
  timestamp: number;
  hits: number;
}

/**
 * LRU Cache for conversion results
 *
 * Caches conversion results to avoid re-processing identical documents.
 * Uses content hash as key to ensure cache validity.
 */
export class ConversionCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private maxAge: number;

  /**
   * Create a new conversion cache
   *
   * @param maxSize Maximum number of entries (default: 100)
   * @param maxAge Maximum age in milliseconds (default: 1 hour)
   */
  constructor(maxSize: number = 100, maxAge: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  /**
   * Generate a cache key from buffer content
   */
  private generateKey(buffer: Buffer, format: string): string {
    const hash = createHash('sha256').update(buffer).digest('hex');
    return `${format}:${hash}`;
  }

  /**
   * Get cached result
   */
  get(buffer: Buffer, format: string): ConversionResult | null {
    const key = this.generateKey(buffer, format);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    const age = Date.now() - entry.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count and move to end (LRU)
    entry.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.result;
  }

  /**
   * Store result in cache
   */
  set(buffer: Buffer, format: string, result: ConversionResult): void {
    const key = this.generateKey(buffer, format);

    // If cache is full, remove oldest entry (first in Map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Check if result is cached
   */
  has(buffer: Buffer, format: string): boolean {
    return this.get(buffer, format) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
  } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    const hitRate = this.cache.size > 0 ? totalHits / this.cache.size : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      totalHits,
    };
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getMemoryUsage(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.result.markdown.length * 2; // UTF-16
      total += JSON.stringify(entry.result.metadata).length;
    }
    return total;
  }
}

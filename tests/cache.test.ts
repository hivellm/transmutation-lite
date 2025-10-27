import { describe, it, expect, beforeEach } from 'vitest';
import { ConversionCache } from '../src/cache.js';
import type { ConversionResult } from '../src/types.js';
import { DocumentFormat } from '../src/types.js';

describe('ConversionCache', () => {
  let cache: ConversionCache;

  beforeEach(() => {
    cache = new ConversionCache(5, 1000); // Max 5 entries, 1 second TTL
  });

  const createMockResult = (text: string): ConversionResult => ({
    markdown: text,
    metadata: {
      format: DocumentFormat.TXT,
      fileSize: text.length,
    },
    conversionTimeMs: 10,
  });

  describe('basic operations', () => {
    it('should cache and retrieve results', () => {
      const buffer = Buffer.from('test content');
      const result = createMockResult('# Test');

      cache.set(buffer, 'txt', result);
      const cached = cache.get(buffer, 'txt');

      expect(cached).toEqual(result);
    });

    it('should return null for non-existent entries', () => {
      const buffer = Buffer.from('test');
      expect(cache.get(buffer, 'txt')).toBeNull();
    });

    it('should differentiate by format', () => {
      const buffer = Buffer.from('content');
      const result1 = createMockResult('# HTML');
      const result2 = createMockResult('# TXT');

      cache.set(buffer, 'html', result1);
      cache.set(buffer, 'txt', result2);

      expect(cache.get(buffer, 'html')).toEqual(result1);
      expect(cache.get(buffer, 'txt')).toEqual(result2);
    });

    it('should differentiate by content', () => {
      const buffer1 = Buffer.from('content1');
      const buffer2 = Buffer.from('content2');
      const result1 = createMockResult('# Result 1');
      const result2 = createMockResult('# Result 2');

      cache.set(buffer1, 'txt', result1);
      cache.set(buffer2, 'txt', result2);

      expect(cache.get(buffer1, 'txt')).toEqual(result1);
      expect(cache.get(buffer2, 'txt')).toEqual(result2);
    });

    it('should check if entry exists', () => {
      const buffer = Buffer.from('test');
      const result = createMockResult('# Test');

      expect(cache.has(buffer, 'txt')).toBe(false);
      cache.set(buffer, 'txt', result);
      expect(cache.has(buffer, 'txt')).toBe(true);
    });
  });

  describe('LRU behavior', () => {
    it('should evict oldest entry when full', () => {
      const buffers = Array.from({ length: 6 }, (_, i) =>
        Buffer.from(`content${i}`)
      );
      const results = buffers.map((_, i) => createMockResult(`# Result ${i}`));

      // Fill cache beyond capacity
      buffers.forEach((buffer, i) => {
        cache.set(buffer, 'txt', results[i]);
      });

      // First entry should be evicted
      expect(cache.get(buffers[0], 'txt')).toBeNull();
      // Last entry should exist
      expect(cache.get(buffers[5], 'txt')).toEqual(results[5]);
    });

    it('should move accessed entries to end', () => {
      const buffers = Array.from({ length: 5 }, (_, i) =>
        Buffer.from(`content${i}`)
      );
      const results = buffers.map((_, i) => createMockResult(`# Result ${i}`));

      // Fill cache to capacity
      buffers.forEach((buffer, i) => {
        cache.set(buffer, 'txt', results[i]);
      });

      // Access first entry
      cache.get(buffers[0], 'txt');

      // Add new entry
      const newBuffer = Buffer.from('new content');
      cache.set(newBuffer, 'txt', createMockResult('# New'));

      // First entry should still exist (was accessed)
      expect(cache.get(buffers[0], 'txt')).not.toBeNull();
      // Second entry should be evicted
      expect(cache.get(buffers[1], 'txt')).toBeNull();
    });
  });

  describe('expiration', () => {
    it('should expire old entries', async () => {
      const buffer = Buffer.from('test');
      const result = createMockResult('# Test');

      cache.set(buffer, 'txt', result);
      expect(cache.get(buffer, 'txt')).toEqual(result);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(cache.get(buffer, 'txt')).toBeNull();
    });

    it('should clear expired entries manually', async () => {
      const buffer = Buffer.from('test');
      cache.set(buffer, 'txt', createMockResult('# Test'));

      await new Promise((resolve) => setTimeout(resolve, 1100));

      cache.clearExpired();
      expect(cache.getStats().size).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should track cache size', () => {
      expect(cache.getStats().size).toBe(0);

      cache.set(Buffer.from('test1'), 'txt', createMockResult('# Test 1'));
      expect(cache.getStats().size).toBe(1);

      cache.set(Buffer.from('test2'), 'txt', createMockResult('# Test 2'));
      expect(cache.getStats().size).toBe(2);
    });

    it('should track hit count', () => {
      const buffer = Buffer.from('test');
      cache.set(buffer, 'txt', createMockResult('# Test'));

      cache.get(buffer, 'txt');
      cache.get(buffer, 'txt');
      cache.get(buffer, 'txt');

      const stats = cache.getStats();
      expect(stats.totalHits).toBe(3);
    });

    it('should calculate hit rate', () => {
      cache.set(Buffer.from('test1'), 'txt', createMockResult('# Test 1'));
      cache.set(Buffer.from('test2'), 'txt', createMockResult('# Test 2'));

      cache.get(Buffer.from('test1'), 'txt');
      cache.get(Buffer.from('test1'), 'txt');

      const stats = cache.getStats();
      expect(stats.hitRate).toBe(1); // 2 hits / 2 entries
    });

    it('should estimate memory usage', () => {
      const result = createMockResult('# Test markdown content');
      cache.set(Buffer.from('test'), 'txt', result);

      const memoryUsage = cache.getMemoryUsage();
      expect(memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('cache management', () => {
    it('should clear all entries', () => {
      cache.set(Buffer.from('test1'), 'txt', createMockResult('# Test 1'));
      cache.set(Buffer.from('test2'), 'txt', createMockResult('# Test 2'));

      expect(cache.getStats().size).toBe(2);

      cache.clear();

      expect(cache.getStats().size).toBe(0);
    });

    it('should handle empty cache gracefully', () => {
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalHits).toBe(0);
    });
  });
});

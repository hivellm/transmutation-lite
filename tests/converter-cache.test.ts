import { describe, it, expect } from 'vitest';
import { Converter } from '../src/index.js';
import { DocumentFormat } from '../src/types.js';

describe('Converter with Cache', () => {
  describe('cache integration', () => {
    it('should not use cache by default', async () => {
      const converter = new Converter();
      const buffer = Buffer.from('# Test content');

      await converter.convertBuffer(buffer, DocumentFormat.TXT);
      
      const stats = converter.getCacheStats();
      expect(stats).toBeUndefined();
    });

    it('should use cache when enabled', async () => {
      const converter = new Converter({ enableCache: true });
      const buffer = Buffer.from('# Test content');

      // First conversion
      const result1 = await converter.convertBuffer(buffer, DocumentFormat.TXT);
      
      // Second conversion (should be cached)
      const result2 = await converter.convertBuffer(buffer, DocumentFormat.TXT);

      expect(result1).toEqual(result2);
      
      const stats = converter.getCacheStats();
      expect(stats).toBeDefined();
      expect(stats!.size).toBe(1);
      expect(stats!.totalHits).toBe(1); // Second call was a cache hit
    });

    it('should respect cache size limit', async () => {
      const converter = new Converter({ 
        enableCache: true, 
        cacheSize: 2 
      });

      const buffers = [
        Buffer.from('content1'),
        Buffer.from('content2'),
        Buffer.from('content3'),
      ];

      for (const buffer of buffers) {
        await converter.convertBuffer(buffer, DocumentFormat.TXT);
      }

      const stats = converter.getCacheStats();
      expect(stats!.size).toBe(2); // Limited to 2 entries
    });

    it('should cache different formats separately', async () => {
      const converter = new Converter({ enableCache: true });
      const buffer = Buffer.from('# Test');

      await converter.convertBuffer(buffer, DocumentFormat.TXT);
      await converter.convertBuffer(Buffer.from('<html><body>Test</body></html>'), DocumentFormat.HTML);

      const stats = converter.getCacheStats();
      expect(stats!.size).toBe(2);
    });

    it('should clear cache', async () => {
      const converter = new Converter({ enableCache: true });
      const buffer = Buffer.from('# Test');

      await converter.convertBuffer(buffer, DocumentFormat.TXT);
      expect(converter.getCacheStats()!.size).toBe(1);

      converter.clearCache();
      expect(converter.getCacheStats()!.size).toBe(0);
    });

    it('should report cache memory usage', async () => {
      const converter = new Converter({ enableCache: true });
      const buffer = Buffer.from('# Test content with some length');

      await converter.convertBuffer(buffer, DocumentFormat.TXT);

      const memoryUsage = converter.getCacheMemoryUsage();
      expect(memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('performance with cache', () => {
    it('should be faster on cache hit', async () => {
      const converter = new Converter({ enableCache: true });
      const buffer = Buffer.from('# Large test content\n'.repeat(100));

      // First conversion (no cache)
      const start1 = performance.now();
      await converter.convertBuffer(buffer, DocumentFormat.TXT);
      const time1 = performance.now() - start1;

      // Second conversion (cached)
      const start2 = performance.now();
      await converter.convertBuffer(buffer, DocumentFormat.TXT);
      const time2 = performance.now() - start2;

      // Cache hit should be significantly faster
      expect(time2).toBeLessThan(time1);
    });

    it('should handle repeated conversions efficiently', async () => {
      const converter = new Converter({ enableCache: true });
      const buffer = Buffer.from('# Test');

      // Convert same content multiple times
      for (let i = 0; i < 10; i++) {
        await converter.convertBuffer(buffer, DocumentFormat.TXT);
      }

      const stats = converter.getCacheStats();
      expect(stats!.size).toBe(1);
      expect(stats!.totalHits).toBe(9); // 10 conversions - 1 initial = 9 hits
    });
  });

  describe('cache expiration', () => {
    it('should respect cache max age', async () => {
      const converter = new Converter({ 
        enableCache: true,
        cacheMaxAge: 100 // 100ms
      });
      const buffer = Buffer.from('# Test');

      await converter.convertBuffer(buffer, DocumentFormat.TXT);
      expect(converter.getCacheStats()!.size).toBe(1);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // This should trigger a new conversion, not a cache hit
      await converter.convertBuffer(buffer, DocumentFormat.TXT);
      
      const stats = converter.getCacheStats();
      // Size should still be 1 (old entry replaced)
      expect(stats!.size).toBe(1);
    });
  });
});


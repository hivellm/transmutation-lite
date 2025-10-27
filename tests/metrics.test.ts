import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsCollector } from '../src/metrics.js';

describe('MetricsCollector', () => {
  let metrics: MetricsCollector;

  beforeEach(() => {
    metrics = new MetricsCollector();
  });

  describe('success recording', () => {
    it('should record successful conversions', () => {
      metrics.recordSuccess('pdf', 1024, 100, false);
      
      const m = metrics.getMetrics();
      expect(m.totalConversions).toBe(1);
      expect(m.successfulConversions).toBe(1);
      expect(m.failedConversions).toBe(0);
      expect(m.totalBytesProcessed).toBe(1024);
      expect(m.totalTimeMs).toBe(100);
    });

    it('should track cache hits and misses', () => {
      metrics.recordSuccess('pdf', 1024, 100, false); // cache miss
      metrics.recordSuccess('pdf', 1024, 10, true);   // cache hit
      
      const m = metrics.getMetrics();
      expect(m.cacheHits).toBe(1);
      expect(m.cacheMisses).toBe(1);
    });

    it('should track conversions by format', () => {
      metrics.recordSuccess('pdf', 1024, 100, false);
      metrics.recordSuccess('pdf', 2048, 200, false);
      metrics.recordSuccess('docx', 512, 50, false);
      
      const m = metrics.getMetrics();
      expect(m.conversionsByFormat.get('pdf')).toBe(2);
      expect(m.conversionsByFormat.get('docx')).toBe(1);
    });
  });

  describe('failure recording', () => {
    it('should record failed conversions', () => {
      metrics.recordFailure('pdf', 'ConversionError');
      
      const m = metrics.getMetrics();
      expect(m.totalConversions).toBe(1);
      expect(m.successfulConversions).toBe(0);
      expect(m.failedConversions).toBe(1);
    });

    it('should track errors by type', () => {
      metrics.recordFailure('pdf', 'ConversionError');
      metrics.recordFailure('docx', 'ConversionError');
      metrics.recordFailure('pdf', 'TimeoutError');
      
      const m = metrics.getMetrics();
      expect(m.errorsByType.get('ConversionError')).toBe(2);
      expect(m.errorsByType.get('TimeoutError')).toBe(1);
    });

    it('should still track format on failures', () => {
      metrics.recordFailure('pdf', 'ConversionError');
      metrics.recordFailure('pdf', 'TimeoutError');
      
      const m = metrics.getMetrics();
      expect(m.conversionsByFormat.get('pdf')).toBe(2);
    });
  });

  describe('summary calculations', () => {
    it('should calculate success rate', () => {
      metrics.recordSuccess('pdf', 1024, 100, false);
      metrics.recordSuccess('docx', 2048, 200, false);
      metrics.recordFailure('txt', 'ConversionError');
      
      const summary = metrics.getSummary();
      expect(summary.successRate).toBeCloseTo(66.67, 1); // 2 of 3 successful
    });

    it('should calculate cache hit rate', () => {
      metrics.recordSuccess('pdf', 1024, 100, false); // miss
      metrics.recordSuccess('pdf', 1024, 10, true);   // hit
      metrics.recordSuccess('docx', 2048, 200, false); // miss
      
      const summary = metrics.getSummary();
      expect(summary.cacheHitRate).toBeCloseTo(33.33, 1); // 1 of 3 was cache hit
    });

    it('should calculate average conversion time', () => {
      metrics.recordSuccess('pdf', 1024, 100, false);
      metrics.recordSuccess('docx', 2048, 200, false);
      
      const summary = metrics.getSummary();
      expect(summary.avgConversionTime).toBe(150); // (100 + 200) / 2
    });

    it('should calculate average throughput', () => {
      metrics.recordSuccess('pdf', 1000, 1000, false); // 1 byte/ms = 1000 bytes/s
      
      const summary = metrics.getSummary();
      expect(summary.avgThroughput).toBe(1000); // bytes per second
    });

    it('should handle zero conversions gracefully', () => {
      const summary = metrics.getSummary();
      expect(summary.successRate).toBe(0);
      expect(summary.cacheHitRate).toBe(0);
      expect(summary.avgConversionTime).toBe(0);
      expect(summary.avgThroughput).toBe(0);
    });
  });

  describe('reset functionality', () => {
    it('should reset all metrics', () => {
      metrics.recordSuccess('pdf', 1024, 100, false);
      metrics.recordSuccess('docx', 2048, 200, false);
      metrics.recordFailure('txt', 'ConversionError');
      
      metrics.reset();
      
      const m = metrics.getMetrics();
      expect(m.totalConversions).toBe(0);
      expect(m.successfulConversions).toBe(0);
      expect(m.failedConversions).toBe(0);
      expect(m.totalBytesProcessed).toBe(0);
      expect(m.totalTimeMs).toBe(0);
      expect(m.cacheHits).toBe(0);
      expect(m.cacheMisses).toBe(0);
      expect(m.errorsByType.size).toBe(0);
      expect(m.conversionsByFormat.size).toBe(0);
    });
  });

  describe('JSON export', () => {
    it('should export metrics as JSON', () => {
      metrics.recordSuccess('pdf', 1024, 100, false);
      metrics.recordSuccess('pdf', 2048, 200, true);
      metrics.recordFailure('docx', 'ConversionError');
      
      const json = metrics.toJSON();
      
      expect(json.timestamp).toBeDefined();
      expect(json.uptime).toBeGreaterThanOrEqual(0);
      expect(json.metrics).toBeDefined();
      expect(json.summary).toBeDefined();
      expect(json.summary.successRate).toBeDefined();
      expect(json.summary.cacheHitRate).toBeDefined();
      expect(json.summary.avgConversionTime).toBeDefined();
      expect(json.summary.avgThroughput).toBeDefined();
    });

    it('should convert Maps to objects in JSON', () => {
      metrics.recordSuccess('pdf', 1024, 100, false);
      metrics.recordFailure('docx', 'ConversionError');
      
      const json = metrics.toJSON();
      
      expect(typeof json.metrics.errorsByType).toBe('object');
      expect(typeof json.metrics.conversionsByFormat).toBe('object');
      expect(json.metrics.errorsByType.ConversionError).toBe(1);
      expect(json.metrics.conversionsByFormat.pdf).toBe(1);
    });

    it('should format summary values with units', () => {
      metrics.recordSuccess('pdf', 1024, 100, false);
      
      const json = metrics.toJSON();
      
      expect(json.summary.successRate).toContain('%');
      expect(json.summary.cacheHitRate).toContain('%');
      expect(json.summary.avgConversionTime).toContain('ms');
      expect(json.summary.avgThroughput).toContain('KB/s');
    });
  });

  describe('uptime tracking', () => {
    it('should track uptime since creation', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const summary = metrics.getSummary();
      expect(summary.uptime).toBeGreaterThanOrEqual(100);
    });

    it('should reset uptime on reset', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      metrics.reset();
      
      const summary = metrics.getSummary();
      expect(summary.uptime).toBeLessThan(50);
    });
  });
});


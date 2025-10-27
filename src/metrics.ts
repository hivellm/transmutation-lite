/**
 * Metrics and monitoring for production use
 */

export interface ConversionMetrics {
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  totalBytesProcessed: number;
  totalTimeMs: number;
  cacheHits: number;
  cacheMisses: number;
  errorsByType: Map<string, number>;
  conversionsByFormat: Map<string, number>;
}

/**
 * Metrics collector for monitoring converter performance
 */
export class MetricsCollector {
  private metrics: ConversionMetrics;
  private startTime: number;

  constructor() {
    this.metrics = {
      totalConversions: 0,
      successfulConversions: 0,
      failedConversions: 0,
      totalBytesProcessed: 0,
      totalTimeMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errorsByType: new Map(),
      conversionsByFormat: new Map(),
    };
    this.startTime = Date.now();
  }

  /**
   * Record a successful conversion
   */
  recordSuccess(
    format: string,
    bytes: number,
    timeMs: number,
    fromCache: boolean
  ): void {
    this.metrics.totalConversions++;
    this.metrics.successfulConversions++;
    this.metrics.totalBytesProcessed += bytes;
    this.metrics.totalTimeMs += timeMs;

    if (fromCache) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    const count = this.metrics.conversionsByFormat.get(format) || 0;
    this.metrics.conversionsByFormat.set(format, count + 1);
  }

  /**
   * Record a failed conversion
   */
  recordFailure(format: string, errorType: string): void {
    this.metrics.totalConversions++;
    this.metrics.failedConversions++;

    const count = this.metrics.errorsByType.get(errorType) || 0;
    this.metrics.errorsByType.set(errorType, count + 1);

    const formatCount = this.metrics.conversionsByFormat.get(format) || 0;
    this.metrics.conversionsByFormat.set(format, formatCount + 1);
  }

  /**
   * Get current metrics
   */
  getMetrics(): ConversionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    uptime: number;
    successRate: number;
    cacheHitRate: number;
    avgConversionTime: number;
    avgThroughput: number;
  } {
    const uptime = Date.now() - this.startTime;
    const successRate =
      this.metrics.totalConversions > 0
        ? (this.metrics.successfulConversions / this.metrics.totalConversions) *
          100
        : 0;

    const totalCacheOps = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate =
      totalCacheOps > 0 ? (this.metrics.cacheHits / totalCacheOps) * 100 : 0;

    const avgConversionTime =
      this.metrics.successfulConversions > 0
        ? this.metrics.totalTimeMs / this.metrics.successfulConversions
        : 0;

    const avgThroughput =
      this.metrics.totalTimeMs > 0
        ? (this.metrics.totalBytesProcessed / this.metrics.totalTimeMs) * 1000 // bytes per second
        : 0;

    return {
      uptime,
      successRate,
      cacheHitRate,
      avgConversionTime,
      avgThroughput,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      totalConversions: 0,
      successfulConversions: 0,
      failedConversions: 0,
      totalBytesProcessed: 0,
      totalTimeMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errorsByType: new Map(),
      conversionsByFormat: new Map(),
    };
    this.startTime = Date.now();
  }

  /**
   * Export metrics as JSON
   */
  toJSON(): any {
    const summary = this.getSummary();
    return {
      timestamp: new Date().toISOString(),
      uptime: summary.uptime,
      metrics: {
        ...this.metrics,
        errorsByType: Object.fromEntries(this.metrics.errorsByType),
        conversionsByFormat: Object.fromEntries(
          this.metrics.conversionsByFormat
        ),
      },
      summary: {
        successRate: summary.successRate.toFixed(2) + '%',
        cacheHitRate: summary.cacheHitRate.toFixed(2) + '%',
        avgConversionTime: summary.avgConversionTime.toFixed(2) + 'ms',
        avgThroughput: (summary.avgThroughput / 1024).toFixed(2) + ' KB/s',
      },
    };
  }
}

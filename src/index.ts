/**
 * Transmutation Lite - Simplified document converter
 * @packageDocumentation
 */

import { readFile } from 'fs/promises';
import { extname } from 'path';
import {
  PdfConverter,
  DocxConverter,
  XlsxConverter,
  PptxConverter,
  TxtConverter,
  HtmlConverter,
  type IConverter,
} from './converters/index.js';
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from './types.js';
import { ConversionCache } from './cache.js';
import { Logger, defaultLogger } from './logger.js';
import {
  validateBuffer,
  validateFormat,
  validateFilePath,
  validateOptions,
  validateCacheConfig,
} from './validation.js';
import { MetricsCollector } from './metrics.js';

// Export types
export { DocumentFormat, ConversionError } from './types.js';
export type {
  ConversionOptions,
  ConversionResult,
  DocumentMetadata,
} from './types.js';
export { ConversionCache } from './cache.js';
export { Logger, LogLevel } from './logger.js';
export { MetricsCollector } from './metrics.js';
export type { ConversionMetrics } from './metrics.js';

/**
 * Configuration options for the Converter
 */
export interface ConverterConfig {
  /**
   * Enable caching of conversion results (default: false)
   */
  enableCache?: boolean;

  /**
   * Maximum number of cached results (default: 100)
   */
  cacheSize?: number;

  /**
   * Maximum age of cached results in milliseconds (default: 1 hour)
   */
  cacheMaxAge?: number;

  /**
   * Logger instance for debugging (optional)
   */
  logger?: Logger;

  /**
   * Enable input validation (default: true)
   */
  validateInput?: boolean;

  /**
   * Enable metrics collection (default: false)
   */
  collectMetrics?: boolean;
}

/**
 * Main converter class that manages all format converters
 */
export class Converter {
  private converters: Map<DocumentFormat, IConverter>;
  private cache?: ConversionCache;
  private logger: Logger;
  private validateInput: boolean;
  private metrics?: MetricsCollector;

  constructor(config?: ConverterConfig) {
    this.converters = new Map();
    this.logger = config?.logger || defaultLogger;
    this.validateInput = config?.validateInput ?? true;

    // Initialize metrics if enabled
    if (config?.collectMetrics) {
      this.metrics = new MetricsCollector();
      this.logger.info('Metrics collection enabled');
    }

    // Validate cache config
    if (config) {
      validateCacheConfig(config);
    }

    // Initialize cache if enabled
    if (config?.enableCache) {
      this.cache = new ConversionCache(
        config.cacheSize || 100,
        config.cacheMaxAge || 3600000
      );
      this.logger.info(
        `Cache enabled: size=${config.cacheSize || 100}, maxAge=${config.cacheMaxAge || 3600000}ms`
      );
    }

    // Register all converters
    this.registerConverter(new PdfConverter());
    this.registerConverter(new DocxConverter());
    this.registerConverter(new XlsxConverter());
    this.registerConverter(new PptxConverter());
    this.registerConverter(new TxtConverter());
    this.registerConverter(new HtmlConverter());
  }

  /**
   * Register a converter
   */
  private registerConverter(converter: IConverter): void {
    this.converters.set(converter.getFormat(), converter);
  }

  /**
   * Detect file format from extension
   */
  detectFormat(filePath: string): DocumentFormat {
    const ext = extname(filePath).toLowerCase().replace('.', '');

    for (const converter of this.converters.values()) {
      if (converter.canHandle(ext)) {
        return converter.getFormat();
      }
    }

    return DocumentFormat.UNKNOWN;
  }

  /**
   * Get converter for a specific format
   */
  private getConverter(format: DocumentFormat): IConverter {
    const converter = this.converters.get(format);

    if (!converter) {
      throw new ConversionError(`No converter available for format: ${format}`);
    }

    return converter;
  }

  /**
   * Convert a file buffer to markdown
   */
  async convertBuffer(
    buffer: Buffer,
    format: DocumentFormat,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();

    // Validate inputs
    if (this.validateInput) {
      validateBuffer(buffer);
      validateFormat(format);
      validateOptions(options);
    }

    this.logger.debug(`Converting ${format} buffer (${buffer.length} bytes)`);

    // Check cache if enabled
    if (this.cache) {
      const cached = this.cache.get(buffer, format);
      if (cached) {
        this.logger.debug(`Cache hit for ${format}`);

        // Record cache hit in metrics
        if (this.metrics) {
          const elapsed = Date.now() - startTime;
          this.metrics.recordSuccess(format, buffer.length, elapsed, true);
        }

        return cached;
      }
      this.logger.debug(`Cache miss for ${format}`);
    }

    try {
      // Convert
      const converter = this.getConverter(format);
      const result = await converter.convert(buffer, options);

      const elapsed = Date.now() - startTime;
      this.logger.info(
        `Converted ${format} in ${elapsed}ms (${(buffer.length / 1024).toFixed(2)} KB)`
      );

      // Store in cache if enabled
      const wasFromCache = false;
      if (this.cache) {
        this.cache.set(buffer, format, result);
        this.logger.debug(`Cached ${format} result`);
      }

      // Record metrics
      if (this.metrics) {
        this.metrics.recordSuccess(
          format,
          buffer.length,
          elapsed,
          wasFromCache
        );
      }

      return result;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      this.logger.error(
        `Conversion failed for ${format} after ${elapsed}ms`,
        error as Error
      );

      // Record failure metrics
      if (this.metrics) {
        const errorType = (error as Error).constructor.name;
        this.metrics.recordFailure(format, errorType);
      }

      throw error;
    }
  }

  /**
   * Convert a file to markdown
   */
  async convertFile(
    filePath: string,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    // Validate file path
    if (this.validateInput) {
      validateFilePath(filePath);
    }

    this.logger.debug(`Converting file: ${filePath}`);

    const format = this.detectFormat(filePath);

    if (format === DocumentFormat.UNKNOWN) {
      const ext = extname(filePath);
      this.logger.error(`Unsupported file format: ${ext}`);
      throw new ConversionError(
        `Unsupported file format: ${ext}. Supported formats: ${this.getSupportedFormats().join(', ')}`
      );
    }

    try {
      const buffer = await readFile(filePath);
      return this.convertBuffer(buffer, format, options);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new ConversionError(`File not found: ${filePath}`);
      }
      if ((error as any).code === 'EACCES') {
        throw new ConversionError(`Permission denied: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Get list of supported formats
   */
  getSupportedFormats(): DocumentFormat[] {
    return Array.from(this.converters.keys());
  }

  /**
   * Check if a file format is supported
   */
  isSupported(filePath: string): boolean {
    return this.detectFormat(filePath) !== DocumentFormat.UNKNOWN;
  }

  /**
   * Clear the conversion cache
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics (if caching is enabled)
   */
  getCacheStats() {
    return this.cache?.getStats();
  }

  /**
   * Get cache memory usage in bytes (if caching is enabled)
   */
  getCacheMemoryUsage(): number {
    return this.cache?.getMemoryUsage() || 0;
  }

  /**
   * Get conversion metrics (if metrics collection is enabled)
   */
  getMetrics() {
    return this.metrics?.getMetrics();
  }

  /**
   * Get metrics summary (if metrics collection is enabled)
   */
  getMetricsSummary() {
    return this.metrics?.getSummary();
  }

  /**
   * Reset metrics (if metrics collection is enabled)
   */
  resetMetrics(): void {
    if (this.metrics) {
      this.metrics.reset();
    }
  }

  /**
   * Export metrics as JSON (if metrics collection is enabled)
   */
  exportMetrics(): any {
    return this.metrics?.toJSON();
  }
}

/**
 * Convenience function to convert a file
 */
export async function convert(
  filePath: string,
  options?: ConversionOptions
): Promise<ConversionResult> {
  const converter = new Converter();
  return converter.convertFile(filePath, options);
}

/**
 * Convenience function to convert a buffer
 */
export async function convertBuffer(
  buffer: Buffer,
  format: DocumentFormat,
  options?: ConversionOptions
): Promise<ConversionResult> {
  const converter = new Converter();
  return converter.convertBuffer(buffer, format, options);
}

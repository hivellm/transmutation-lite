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

// Export types
export {
  DocumentFormat,
  ConversionError,
} from './types.js';
export type {
  ConversionOptions,
  ConversionResult,
  DocumentMetadata,
} from './types.js';
export { ConversionCache } from './cache.js';

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
}

/**
 * Main converter class that manages all format converters
 */
export class Converter {
  private converters: Map<DocumentFormat, IConverter>;
  private cache?: ConversionCache;

  constructor(config?: ConverterConfig) {
    this.converters = new Map();

    // Initialize cache if enabled
    if (config?.enableCache) {
      this.cache = new ConversionCache(
        config.cacheSize || 100,
        config.cacheMaxAge || 3600000
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
    // Check cache if enabled
    if (this.cache) {
      const cached = this.cache.get(buffer, format);
      if (cached) {
        return cached;
      }
    }

    // Convert
    const converter = this.getConverter(format);
    const result = await converter.convert(buffer, options);

    // Store in cache if enabled
    if (this.cache) {
      this.cache.set(buffer, format, result);
    }

    return result;
  }

  /**
   * Convert a file to markdown
   */
  async convertFile(
    filePath: string,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const format = this.detectFormat(filePath);

    if (format === DocumentFormat.UNKNOWN) {
      throw new ConversionError(
        `Unsupported file format: ${extname(filePath)}`
      );
    }

    const buffer = await readFile(filePath);
    return this.convertBuffer(buffer, format, options);
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


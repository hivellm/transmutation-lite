import type {
  ConversionOptions,
  ConversionResult,
  DocumentFormat,
  DocumentMetadata,
} from '../types.js';

/**
 * Base converter interface that all format converters must implement
 */
export interface IConverter {
  /**
   * Convert a file buffer to markdown
   * @param buffer - File buffer to convert
   * @param options - Conversion options
   * @returns Conversion result with markdown and metadata
   */
  convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult>;

  /**
   * Get the format this converter handles
   */
  getFormat(): DocumentFormat;

  /**
   * Check if this converter can handle the given file extension
   * @param extension - File extension (without dot)
   */
  canHandle(extension: string): boolean;
}

/**
 * Abstract base class for converters
 */
export abstract class BaseConverter implements IConverter {
  abstract convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult>;

  abstract getFormat(): DocumentFormat;

  abstract canHandle(extension: string): boolean;

  /**
   * Create base metadata object
   */
  protected createMetadata(
    format: DocumentFormat,
    fileSize: number,
    extra?: Partial<DocumentMetadata>
  ): DocumentMetadata {
    return {
      format,
      fileSize,
      pageCount: extra?.pageCount,
      title: extra?.title,
      author: extra?.author,
      createdAt: extra?.createdAt,
      extra: extra?.extra,
    };
  }

  /**
   * Create conversion result with timing
   */
  protected createResult(
    markdown: string,
    metadata: DocumentMetadata,
    startTime: number,
    warnings?: string[]
  ): ConversionResult {
    return {
      markdown,
      metadata,
      conversionTimeMs: Date.now() - startTime,
      warnings,
    };
  }
}


/**
 * Supported document formats
 */
export enum DocumentFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  XLSX = 'xlsx',
  PPTX = 'pptx',
  TXT = 'txt',
  HTML = 'html',
  UNKNOWN = 'unknown',
}

/**
 * Conversion options
 */
export interface ConversionOptions {
  /**
   * Preserve original formatting where possible
   * @default true
   */
  preserveFormatting?: boolean;

  /**
   * Extract images (not implemented in lite version)
   * @default false
   */
  extractImages?: boolean;

  /**
   * Maximum page/sheet to process (0 = all)
   * @default 0
   */
  maxPages?: number;

  /**
   * Custom output format options
   */
  formatOptions?: Record<string, any>;
}

/**
 * Metadata about the converted document
 */
export interface DocumentMetadata {
  /**
   * Original file format
   */
  format: DocumentFormat;

  /**
   * File size in bytes
   */
  fileSize: number;

  /**
   * Number of pages/sheets/slides
   */
  pageCount?: number;

  /**
   * Document title (if available)
   */
  title?: string;

  /**
   * Document author (if available)
   */
  author?: string;

  /**
   * Creation date (if available)
   */
  createdAt?: Date;

  /**
   * Additional format-specific metadata
   */
  extra?: Record<string, any>;
}

/**
 * Result of a document conversion
 */
export interface ConversionResult {
  /**
   * Converted markdown content
   */
  markdown: string;

  /**
   * Document metadata
   */
  metadata: DocumentMetadata;

  /**
   * Conversion time in milliseconds
   */
  conversionTimeMs: number;

  /**
   * Any warnings during conversion
   */
  warnings?: string[];
}

/**
 * Converter error class
 */
export class ConversionError extends Error {
  constructor(
    message: string,
    public format?: DocumentFormat,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ConversionError';
  }
}


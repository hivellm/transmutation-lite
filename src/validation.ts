import { DocumentFormat, ConversionError } from './types.js';

/**
 * Validation utilities for input checking
 */

/**
 * Validate buffer input
 */
export function validateBuffer(buffer: Buffer): void {
  if (!Buffer.isBuffer(buffer)) {
    throw new ConversionError(
      'Invalid input: expected Buffer, got ' + typeof buffer
    );
  }

  if (buffer.length === 0) {
    throw new ConversionError('Invalid input: buffer is empty');
  }

  // Check for extremely large buffers (> 500MB)
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (buffer.length > maxSize) {
    throw new ConversionError(
      `Invalid input: buffer size (${(buffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)`
    );
  }
}

/**
 * Validate document format
 */
export function validateFormat(format: string): DocumentFormat {
  const validFormats = Object.values(DocumentFormat);
  
  if (!validFormats.includes(format as DocumentFormat)) {
    throw new ConversionError(
      `Invalid format: "${format}". Supported formats: ${validFormats.filter(f => f !== DocumentFormat.UNKNOWN).join(', ')}`
    );
  }

  if (format === DocumentFormat.UNKNOWN) {
    throw new ConversionError(
      'Cannot convert documents with unknown format. Please specify a valid format.'
    );
  }

  return format as DocumentFormat;
}

/**
 * Validate file path
 */
export function validateFilePath(filePath: string): void {
  if (typeof filePath !== 'string') {
    throw new ConversionError(
      'Invalid file path: expected string, got ' + typeof filePath
    );
  }

  if (filePath.trim().length === 0) {
    throw new ConversionError('Invalid file path: path is empty');
  }

  // Check for potentially dangerous paths
  const dangerousPatterns = [
    /\.\./,  // Parent directory traversal
    /^\/etc\//,  // System directories
    /^\/sys\//,
    /^\/proc\//,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(filePath)) {
      throw new ConversionError(
        `Invalid file path: path contains potentially dangerous pattern: ${filePath}`
      );
    }
  }
}

/**
 * Validate conversion options
 */
export function validateOptions(options: any): void {
  if (options === null || options === undefined) {
    return; // Options are optional
  }

  if (typeof options !== 'object') {
    throw new ConversionError(
      'Invalid options: expected object, got ' + typeof options
    );
  }

  // Validate maxPages if provided
  if ('maxPages' in options) {
    if (typeof options.maxPages !== 'number') {
      throw new ConversionError(
        'Invalid option maxPages: expected number, got ' + typeof options.maxPages
      );
    }
    if (options.maxPages < 1) {
      throw new ConversionError(
        'Invalid option maxPages: must be at least 1'
      );
    }
    if (!Number.isInteger(options.maxPages)) {
      throw new ConversionError(
        'Invalid option maxPages: must be an integer'
      );
    }
  }

  // Validate preserveFormatting if provided
  if ('preserveFormatting' in options) {
    if (typeof options.preserveFormatting !== 'boolean') {
      throw new ConversionError(
        'Invalid option preserveFormatting: expected boolean, got ' + typeof options.preserveFormatting
      );
    }
  }
}

/**
 * Validate cache configuration
 */
export function validateCacheConfig(config: any): void {
  if (config === null || config === undefined) {
    return;
  }

  if (typeof config !== 'object') {
    throw new ConversionError(
      'Invalid cache config: expected object, got ' + typeof config
    );
  }

  // Validate cacheSize
  if ('cacheSize' in config) {
    if (typeof config.cacheSize !== 'number') {
      throw new ConversionError(
        'Invalid cacheSize: expected number, got ' + typeof config.cacheSize
      );
    }
    if (config.cacheSize < 1) {
      throw new ConversionError('Invalid cacheSize: must be at least 1');
    }
    if (config.cacheSize > 10000) {
      throw new ConversionError('Invalid cacheSize: maximum is 10000');
    }
  }

  // Validate cacheMaxAge
  if ('cacheMaxAge' in config) {
    if (typeof config.cacheMaxAge !== 'number') {
      throw new ConversionError(
        'Invalid cacheMaxAge: expected number, got ' + typeof config.cacheMaxAge
      );
    }
    if (config.cacheMaxAge < 0) {
      throw new ConversionError('Invalid cacheMaxAge: must be non-negative');
    }
  }

  // Validate enableCache
  if ('enableCache' in config) {
    if (typeof config.enableCache !== 'boolean') {
      throw new ConversionError(
        'Invalid enableCache: expected boolean, got ' + typeof config.enableCache
      );
    }
  }
}


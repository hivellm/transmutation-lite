import { describe, it, expect } from 'vitest';
import {
  validateBuffer,
  validateFormat,
  validateFilePath,
  validateOptions,
  validateCacheConfig,
} from '../src/validation.js';
import { DocumentFormat, ConversionError } from '../src/types.js';

describe('Validation', () => {
  describe('validateBuffer', () => {
    it('should accept valid buffers', () => {
      expect(() => validateBuffer(Buffer.from('test'))).not.toThrow();
    });

    it('should reject non-buffers', () => {
      expect(() => validateBuffer('test' as any)).toThrow(ConversionError);
      expect(() => validateBuffer(123 as any)).toThrow(ConversionError);
      expect(() => validateBuffer(null as any)).toThrow(ConversionError);
    });

    it('should reject empty buffers', () => {
      expect(() => validateBuffer(Buffer.from(''))).toThrow('buffer is empty');
    });

    it('should reject extremely large buffers', () => {
      const largeBuffer = Buffer.alloc(501 * 1024 * 1024); // 501MB
      expect(() => validateBuffer(largeBuffer)).toThrow('exceeds maximum');
    });
  });

  describe('validateFormat', () => {
    it('should accept valid formats', () => {
      expect(validateFormat('pdf')).toBe(DocumentFormat.PDF);
      expect(validateFormat('docx')).toBe(DocumentFormat.DOCX);
      expect(validateFormat('txt')).toBe(DocumentFormat.TXT);
    });

    it('should reject invalid formats', () => {
      expect(() => validateFormat('invalid')).toThrow('Invalid format');
      expect(() => validateFormat('')).toThrow('Invalid format');
    });

    it('should reject unknown format', () => {
      expect(() => validateFormat(DocumentFormat.UNKNOWN)).toThrow(
        'unknown format'
      );
    });

    it('should list supported formats in error', () => {
      try {
        validateFormat('invalid');
      } catch (error) {
        expect((error as Error).message).toContain('Supported formats:');
        expect((error as Error).message).toContain('pdf');
      }
    });
  });

  describe('validateFilePath', () => {
    it('should accept valid file paths', () => {
      expect(() => validateFilePath('/path/to/file.pdf')).not.toThrow();
      expect(() => validateFilePath('relative/path.txt')).not.toThrow();
      expect(() => validateFilePath('C:\\Windows\\file.docx')).not.toThrow();
    });

    it('should reject non-string paths', () => {
      expect(() => validateFilePath(123 as any)).toThrow('expected string');
      expect(() => validateFilePath(null as any)).toThrow('expected string');
    });

    it('should reject empty paths', () => {
      expect(() => validateFilePath('')).toThrow('path is empty');
      expect(() => validateFilePath('   ')).toThrow('path is empty');
    });

    it('should reject dangerous paths', () => {
      expect(() => validateFilePath('../../../etc/passwd')).toThrow(
        'dangerous pattern'
      );
      expect(() => validateFilePath('/etc/shadow')).toThrow(
        'dangerous pattern'
      );
      expect(() => validateFilePath('/sys/kernel')).toThrow(
        'dangerous pattern'
      );
      expect(() => validateFilePath('/proc/meminfo')).toThrow(
        'dangerous pattern'
      );
    });
  });

  describe('validateOptions', () => {
    it('should accept valid options', () => {
      expect(() => validateOptions({ maxPages: 10 })).not.toThrow();
      expect(() => validateOptions({ preserveFormatting: true })).not.toThrow();
      expect(() => validateOptions({})).not.toThrow();
    });

    it('should accept undefined/null options', () => {
      expect(() => validateOptions(undefined)).not.toThrow();
      expect(() => validateOptions(null)).not.toThrow();
    });

    it('should reject non-object options', () => {
      expect(() => validateOptions('string' as any)).toThrow('expected object');
      expect(() => validateOptions(123 as any)).toThrow('expected object');
    });

    it('should validate maxPages', () => {
      expect(() => validateOptions({ maxPages: 'ten' as any })).toThrow(
        'expected number'
      );
      expect(() => validateOptions({ maxPages: 0 })).toThrow(
        'must be at least 1'
      );
      expect(() => validateOptions({ maxPages: -5 })).toThrow(
        'must be at least 1'
      );
      expect(() => validateOptions({ maxPages: 3.5 })).toThrow(
        'must be an integer'
      );
    });

    it('should validate preserveFormatting', () => {
      expect(() =>
        validateOptions({ preserveFormatting: 'yes' as any })
      ).toThrow('expected boolean');
      expect(() => validateOptions({ preserveFormatting: 1 as any })).toThrow(
        'expected boolean'
      );
    });
  });

  describe('validateCacheConfig', () => {
    it('should accept valid cache configs', () => {
      expect(() => validateCacheConfig({ enableCache: true })).not.toThrow();
      expect(() => validateCacheConfig({ cacheSize: 50 })).not.toThrow();
      expect(() => validateCacheConfig({ cacheMaxAge: 1000 })).not.toThrow();
    });

    it('should accept undefined/null config', () => {
      expect(() => validateCacheConfig(undefined)).not.toThrow();
      expect(() => validateCacheConfig(null)).not.toThrow();
    });

    it('should reject non-object config', () => {
      expect(() => validateCacheConfig('string' as any)).toThrow(
        'expected object'
      );
    });

    it('should validate cacheSize', () => {
      expect(() => validateCacheConfig({ cacheSize: 'fifty' as any })).toThrow(
        'expected number'
      );
      expect(() => validateCacheConfig({ cacheSize: 0 })).toThrow(
        'must be at least 1'
      );
      expect(() => validateCacheConfig({ cacheSize: 20000 })).toThrow(
        'maximum is 10000'
      );
    });

    it('should validate cacheMaxAge', () => {
      expect(() => validateCacheConfig({ cacheMaxAge: 'long' as any })).toThrow(
        'expected number'
      );
      expect(() => validateCacheConfig({ cacheMaxAge: -100 })).toThrow(
        'must be non-negative'
      );
    });

    it('should validate enableCache', () => {
      expect(() => validateCacheConfig({ enableCache: 'yes' as any })).toThrow(
        'expected boolean'
      );
      expect(() => validateCacheConfig({ enableCache: 1 as any })).toThrow(
        'expected boolean'
      );
    });
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TxtConverter } from '../../src/converters/txt.js';
import { DocumentFormat } from '../../src/types.js';

describe('TxtConverter', () => {
  const converter = new TxtConverter();
  const fixturesDir = join(process.cwd(), 'tests/test-fixtures/txt');

  describe('format detection', () => {
    it('should handle .txt extension', () => {
      expect(converter.canHandle('txt')).toBe(true);
    });

    it('should handle .md extension', () => {
      expect(converter.canHandle('md')).toBe(true);
    });

    it('should reject other extensions', () => {
      expect(converter.canHandle('pdf')).toBe(false);
      expect(converter.canHandle('docx')).toBe(false);
    });

    it('should return correct format', () => {
      expect(converter.getFormat()).toBe(DocumentFormat.TXT);
    });
  });

  describe('conversion', () => {
    it('should convert simple text file', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.txt'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.markdown).toContain('This is a simple text file');
      expect(result.metadata.format).toBe(DocumentFormat.TXT);
      expect(result.metadata.fileSize).toBe(buffer.length);
      expect(result.conversionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should normalize line endings', async () => {
      const textWithCRLF = 'Line 1\r\nLine 2\r\nLine 3';
      const buffer = Buffer.from(textWithCRLF);
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('Line 1\n');
      expect(result.markdown).not.toContain('\r\n');
    });

    it('should remove excessive blank lines', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.txt'));
      const result = await converter.convert(buffer);

      // Should not have more than 2 consecutive newlines
      expect(result.markdown).not.toMatch(/\n\n\n+/);
    });

    it('should handle empty file', async () => {
      const buffer = Buffer.from('');
      const result = await converter.convert(buffer);

      expect(result.markdown).toBe('');
      expect(result.metadata.fileSize).toBe(0);
    });

    it('should handle file with only whitespace', async () => {
      const buffer = Buffer.from('   \n\n   \n   ');
      const result = await converter.convert(buffer);

      expect(result.markdown.trim()).toBe('');
    });

    it('should preserve important content structure', async () => {
      const buffer = readFileSync(join(fixturesDir, 'with-metadata.txt'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('Title: Test Document');
      expect(result.markdown).toContain('Content paragraph 1');
    });
  });

  describe('edge cases', () => {
    it('should handle UTF-8 characters', async () => {
      const text = 'Hello 世界 🌍 Привет';
      const buffer = Buffer.from(text, 'utf-8');
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('世界');
      expect(result.markdown).toContain('🌍');
      expect(result.markdown).toContain('Привет');
    });

    it('should handle very long lines', async () => {
      const longLine = 'A'.repeat(10000);
      const buffer = Buffer.from(longLine);
      const result = await converter.convert(buffer);

      expect(result.markdown).toHaveLength(longLine.length);
    });

    it('should track conversion time', async () => {
      const buffer = Buffer.from('Test content');
      const result = await converter.convert(buffer);

      expect(result.conversionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.conversionTimeMs).toBeLessThan(100); // Should be fast
    });
  });
});


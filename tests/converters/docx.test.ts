import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { DocxConverter } from '../../src/converters/docx.js';
import { DocumentFormat } from '../../src/types.js';

describe('DocxConverter', () => {
  const converter = new DocxConverter();
  const fixturesDir = join(process.cwd(), 'tests/test-fixtures/docx');
  const hasFixtures = existsSync(join(fixturesDir, 'simple.docx'));

  describe('format detection', () => {
    it('should handle .docx extension', () => {
      expect(converter.canHandle('docx')).toBe(true);
    });

    it('should reject other extensions', () => {
      expect(converter.canHandle('pdf')).toBe(false);
      expect(converter.canHandle('txt')).toBe(false);
    });

    it('should return correct format', () => {
      expect(converter.getFormat()).toBe(DocumentFormat.DOCX);
    });
  });

  describe('conversion', () => {
    it.skipIf(!hasFixtures)('should convert simple DOCX', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.docx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.markdown.length).toBeGreaterThan(0);
      expect(result.metadata.format).toBe(DocumentFormat.DOCX);
      expect(result.metadata.fileSize).toBe(buffer.length);
    });

    it.skipIf(!hasFixtures)('should extract text content', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.docx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('Hello World');
      expect(result.markdown).toContain('This is a simple DOCX document');
    });

    it.skipIf(!hasFixtures)('should convert DOCX with formatting', async () => {
      const buffer = readFileSync(join(fixturesDir, 'formatted.docx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.markdown.length).toBeGreaterThan(0);
      // Mammoth should preserve some formatting
      expect(result.markdown).toMatch(/[*_#]/); // Should have markdown formatting
    });

    it.skipIf(!hasFixtures)('should track conversion time', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.docx'));
      const result = await converter.convert(buffer);

      expect(result.conversionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.conversionTimeMs).toBeLessThan(5000);
    });

    it.skipIf(!hasFixtures)('should handle empty DOCX gracefully', async () => {
      const buffer = readFileSync(join(fixturesDir, 'empty.docx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.metadata.format).toBe(DocumentFormat.DOCX);
    });
  });

  describe('error handling', () => {
    it('should handle invalid DOCX', async () => {
      const buffer = Buffer.from('not a real docx file');
      
      await expect(async () => {
        await converter.convert(buffer);
      }).rejects.toThrow();
    });
  });
});


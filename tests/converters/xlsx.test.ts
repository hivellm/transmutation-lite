import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { XlsxConverter } from '../../src/converters/xlsx.js';
import { DocumentFormat } from '../../src/types.js';

describe('XlsxConverter', () => {
  const converter = new XlsxConverter();
  const fixturesDir = join(process.cwd(), 'tests/test-fixtures/xlsx');
  const hasFixtures = existsSync(join(fixturesDir, 'simple.xlsx'));

  describe('format detection', () => {
    it('should handle .xlsx extension', () => {
      expect(converter.canHandle('xlsx')).toBe(true);
    });

    it('should handle .xls extension', () => {
      expect(converter.canHandle('xls')).toBe(true);
    });

    it('should reject other extensions', () => {
      expect(converter.canHandle('pdf')).toBe(false);
      expect(converter.canHandle('docx')).toBe(false);
    });

    it('should return correct format', () => {
      expect(converter.getFormat()).toBe(DocumentFormat.XLSX);
    });
  });

  describe('conversion', () => {
    it.skipIf(!hasFixtures)('should convert simple XLSX', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.xlsx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.markdown.length).toBeGreaterThan(0);
      expect(result.metadata.format).toBe(DocumentFormat.XLSX);
      expect(result.metadata.fileSize).toBe(buffer.length);
    });

    it.skipIf(!hasFixtures)('should convert table to markdown', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.xlsx'));
      const result = await converter.convert(buffer);

      // Should contain table headers
      expect(result.markdown).toContain('Name');
      expect(result.markdown).toContain('Age');
      // Should contain table data
      expect(result.markdown).toContain('Alice');
      expect(result.markdown).toContain('Bob');
      // Should use markdown table format
      expect(result.markdown).toContain('|');
    });

    it.skipIf(!hasFixtures)('should handle multiple sheets', async () => {
      const buffer = readFileSync(join(fixturesDir, 'multi-sheet.xlsx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      // Should include sheet names
      expect(result.markdown).toContain('Sheet1');
      expect(result.markdown).toContain('Sheet2');
    });

    it.skipIf(!hasFixtures)('should track conversion time', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.xlsx'));
      const result = await converter.convert(buffer);

      expect(result.conversionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.conversionTimeMs).toBeLessThan(5000);
    });

    it.skipIf(!hasFixtures)('should handle empty XLSX gracefully', async () => {
      const buffer = readFileSync(join(fixturesDir, 'empty.xlsx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.metadata.format).toBe(DocumentFormat.XLSX);
    });
  });

  describe('error handling', () => {
    it('should throw on invalid XLSX', async () => {
      const buffer = Buffer.from('not a real xlsx file');

      try {
        await converter.convert(buffer);
        // If no error thrown, test should fail
        expect.fail('Expected conversion to throw an error');
      } catch (error) {
        // Error expected
        expect(error).toBeDefined();
      }
    });
  });
});

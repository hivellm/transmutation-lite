import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PdfConverter } from '../../src/converters/pdf.js';
import { DocumentFormat } from '../../src/types.js';

describe('PdfConverter', () => {
  const converter = new PdfConverter();
  const fixturesDir = join(process.cwd(), 'tests/test-fixtures/pdf');

  describe('format detection', () => {
    it('should handle .pdf extension', () => {
      expect(converter.canHandle('pdf')).toBe(true);
    });

    it('should reject other extensions', () => {
      expect(converter.canHandle('docx')).toBe(false);
      expect(converter.canHandle('txt')).toBe(false);
    });

    it('should return correct format', () => {
      expect(converter.getFormat()).toBe(DocumentFormat.PDF);
    });
  });

  describe('conversion', () => {
    it('should convert real PDF from arXiv', async () => {
      const buffer = readFileSync(join(fixturesDir, 'arxiv-2510.21695.pdf'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.markdown.length).toBeGreaterThan(1000);
      expect(result.metadata.format).toBe(DocumentFormat.PDF);
      expect(result.metadata.fileSize).toBe(buffer.length);
      expect(result.metadata.pageCount).toBe(10);
    });

    it('should extract text from multi-page PDF', async () => {
      const buffer = readFileSync(
        join(fixturesDir, 'arxiv-2510.21618-deepagent.pdf')
      );
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('DeepAgent');
      expect(result.metadata.pageCount).toBeGreaterThan(10); // Has many pages
      expect(result.markdown.length).toBeGreaterThan(10000);
    });

    it('should extract metadata from PDF', async () => {
      const buffer = readFileSync(join(fixturesDir, 'arxiv-2510.21695.pdf'));
      const result = await converter.convert(buffer);

      expect(result.metadata.format).toBe(DocumentFormat.PDF);
      expect(result.metadata.pageCount).toBeDefined();
      expect(result.metadata.fileSize).toBeGreaterThan(0);
    });

    it('should track conversion time', async () => {
      const buffer = readFileSync(join(fixturesDir, 'arxiv-2510.21695.pdf'));
      const result = await converter.convert(buffer);

      expect(result.conversionTimeMs).toBeGreaterThan(0);
      expect(result.conversionTimeMs).toBeLessThan(5000); // Should complete in 5s
    });

    it('should accept page limit option', async () => {
      const buffer = readFileSync(
        join(fixturesDir, 'arxiv-2510.21618-deepagent.pdf')
      );
      const result = await converter.convert(buffer, { maxPages: 3 });

      // Should accept the option without errors
      expect(result.markdown).toBeDefined();
      expect(result.markdown.length).toBeGreaterThan(0);
    });

    it('should preserve formatting by default', async () => {
      const buffer = readFileSync(join(fixturesDir, 'arxiv-2510.21695.pdf'));
      const result = await converter.convert(buffer, {
        preserveFormatting: true,
      });

      // Should not have excessive whitespace
      expect(result.markdown).not.toMatch(/   +/); // No 3+ spaces
      expect(result.markdown).not.toMatch(/\n{4,}/); // No 4+ newlines
    });

    it('should handle large PDF', async () => {
      const buffer = readFileSync(
        join(fixturesDir, 'arxiv-2510.21618-deepagent.pdf')
      );
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.conversionTimeMs).toBeLessThan(10000); // Should complete in 10s
    });
  });

  describe('edge cases', () => {
    it('should handle conversion without formatting cleanup', async () => {
      const buffer = readFileSync(join(fixturesDir, 'arxiv-2510.21695.pdf'));
      const result = await converter.convert(buffer, {
        preserveFormatting: false,
      });

      expect(result.markdown).toBeDefined();
      expect(result.markdown.length).toBeGreaterThan(0);
    });

    it('should clean up text properly', async () => {
      const buffer = readFileSync(
        join(fixturesDir, 'arxiv-2510.21275-uct.pdf')
      );
      const result = await converter.convert(buffer);

      // Should contain actual content
      expect(result.markdown).toContain('Investigating');
      expect(result.markdown.length).toBeGreaterThan(5000);
    });
  });
});

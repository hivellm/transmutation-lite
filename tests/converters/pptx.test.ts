import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PptxConverter } from '../../src/converters/pptx.js';
import { DocumentFormat } from '../../src/types.js';

describe('PptxConverter', () => {
  const converter = new PptxConverter();
  const fixturesDir = join(process.cwd(), 'tests/test-fixtures/pptx');
  const hasFixtures = existsSync(join(fixturesDir, 'simple.pptx'));

  describe('format detection', () => {
    it('should handle .pptx extension', () => {
      expect(converter.canHandle('pptx')).toBe(true);
    });

    it('should handle .ppt extension', () => {
      expect(converter.canHandle('ppt')).toBe(true);
    });

    it('should reject other extensions', () => {
      expect(converter.canHandle('pdf')).toBe(false);
      expect(converter.canHandle('docx')).toBe(false);
    });

    it('should return correct format', () => {
      expect(converter.getFormat()).toBe(DocumentFormat.PPTX);
    });
  });

  describe('conversion', () => {
    it.skipIf(!hasFixtures)('should convert simple PPTX', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.pptx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.markdown.length).toBeGreaterThan(0);
      expect(result.metadata.format).toBe(DocumentFormat.PPTX);
      expect(result.metadata.fileSize).toBe(buffer.length);
    });

    it.skipIf(!hasFixtures)('should extract slide text', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.pptx'));
      const result = await converter.convert(buffer);

      // Should contain slide content
      expect(result.markdown).toContain('Slide 1');
      expect(result.markdown).toContain('Welcome to the Presentation');
    });

    it.skipIf(!hasFixtures)('should handle multiple slides', async () => {
      const buffer = readFileSync(join(fixturesDir, 'multi-slide.pptx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      // Should separate slides
      expect(result.markdown).toContain('Slide 1');
      expect(result.markdown).toContain('Slide 2');
      expect(result.markdown).toContain('Slide 3');
    });

    it.skipIf(!hasFixtures)('should track conversion time', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.pptx'));
      const result = await converter.convert(buffer);

      expect(result.conversionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.conversionTimeMs).toBeLessThan(5000);
    });

    it.skipIf(!hasFixtures)('should handle empty PPTX gracefully', async () => {
      const buffer = readFileSync(join(fixturesDir, 'empty.pptx'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.metadata.format).toBe(DocumentFormat.PPTX);
    });
  });

  describe('error handling', () => {
    it('should handle invalid PPTX', async () => {
      const buffer = Buffer.from('not a real pptx file');
      
      await expect(async () => {
        await converter.convert(buffer);
      }).rejects.toThrow();
    });
  });
});


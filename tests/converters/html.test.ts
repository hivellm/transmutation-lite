import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { HtmlConverter } from '../../src/converters/html.js';
import { DocumentFormat } from '../../src/types.js';

describe('HtmlConverter', () => {
  const converter = new HtmlConverter();
  const fixturesDir = join(process.cwd(), 'tests/test-fixtures/html');

  describe('format detection', () => {
    it('should handle .html extension', () => {
      expect(converter.canHandle('html')).toBe(true);
    });

    it('should handle .htm extension', () => {
      expect(converter.canHandle('htm')).toBe(true);
    });

    it('should reject other extensions', () => {
      expect(converter.canHandle('pdf')).toBe(false);
    });

    it('should return correct format', () => {
      expect(converter.getFormat()).toBe(DocumentFormat.HTML);
    });
  });

  describe('conversion', () => {
    it('should convert simple HTML', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.html'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toBeDefined();
      expect(result.markdown).toContain('# Main Heading');
      expect(result.markdown).toContain('This is a simple paragraph');
      expect(result.metadata.format).toBe(DocumentFormat.HTML);
    });

    it('should preserve heading levels', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.html'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('# Main Heading'); // H1
      expect(result.markdown).toContain('## Subheading'); // H2
    });

    it('should convert lists', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.html'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('-   List item 1');
      expect(result.markdown).toContain('-   List item 2');
    });

    it('should convert links', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.html'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('[Example](https://example.com)');
    });

    it('should extract title metadata', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.html'));
      const result = await converter.convert(buffer);

      expect(result.metadata.title).toBe('Simple HTML Test');
    });

    it('should handle complex HTML', async () => {
      const buffer = readFileSync(join(fixturesDir, 'complex.html'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('**bold**');
      expect(result.markdown).toContain('_italic_');
      expect(result.markdown).toContain('`inline code`');
    });

    it('should convert code blocks', async () => {
      const buffer = readFileSync(join(fixturesDir, 'complex.html'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('```');
      expect(result.markdown).toContain('function example()');
    });

    it('should convert blockquotes', async () => {
      const buffer = readFileSync(join(fixturesDir, 'complex.html'));
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('>');
      expect(result.markdown).toContain('This is a quote');
    });
  });

  describe('edge cases', () => {
    it('should handle empty HTML', async () => {
      const html = '<html><body></body></html>';
      const buffer = Buffer.from(html);
      const result = await converter.convert(buffer);

      expect(result.markdown.trim()).toBe('');
    });

    it('should handle HTML with only text', async () => {
      const html = '<html><body>Plain text only</body></html>';
      const buffer = Buffer.from(html);
      const result = await converter.convert(buffer);

      expect(result.markdown).toContain('Plain text only');
    });

    it('should remove script tags', async () => {
      const html =
        '<html><body><script>alert("test")</script><p>Content</p></body></html>';
      const buffer = Buffer.from(html);
      const result = await converter.convert(buffer);

      expect(result.markdown).not.toContain('alert');
      expect(result.markdown).toContain('Content');
    });

    it('should remove style tags', async () => {
      const html =
        '<html><head><style>body { color: red; }</style></head><body><p>Content</p></body></html>';
      const buffer = Buffer.from(html);
      const result = await converter.convert(buffer);

      expect(result.markdown).not.toContain('color: red');
      expect(result.markdown).toContain('Content');
    });

    it('should track conversion time', async () => {
      const buffer = readFileSync(join(fixturesDir, 'simple.html'));
      const result = await converter.convert(buffer);

      expect(result.conversionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.conversionTimeMs).toBeLessThan(100);
    });
  });
});

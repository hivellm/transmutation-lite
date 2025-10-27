import { describe, it, expect } from 'vitest';
import { Converter } from '../../src/index.js';

describe('CLI Integration Tests', () => {
  const converter = new Converter();

  it('should provide supported formats list', () => {
    const formats = converter.getSupportedFormats();
    
    expect(formats).toContain('pdf');
    expect(formats).toContain('docx');
    expect(formats).toContain('xlsx');
    expect(formats).toContain('pptx');
    expect(formats).toContain('html');
    expect(formats).toContain('txt');
  });

  it('should convert with conversion options', async () => {
    const html = '<h1>Test</h1><p>Content</p>';
    const buffer = Buffer.from(html);
    
    const result = await converter.convertBuffer(buffer, 'html', {
      preserveFormatting: true,
    });
    
    expect(result.markdown).toBeDefined();
  });

  it('should handle preserveFormatting option', async () => {
    const text = 'Line 1\n\n\n\nLine 2';
    const buffer = Buffer.from(text);
    
    const withFormatting = await converter.convertBuffer(buffer, 'txt', {
      preserveFormatting: true,
    });
    
    const withoutFormatting = await converter.convertBuffer(buffer, 'txt', {
      preserveFormatting: false,
    });
    
    expect(withFormatting.markdown).toBeDefined();
    expect(withoutFormatting.markdown).toBeDefined();
  });
});


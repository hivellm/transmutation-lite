import { describe, it, expect } from 'vitest';
import { Converter, DocumentFormat, ConversionError } from './index.js';

describe('Converter', () => {
  const converter = new Converter();

  describe('detectFormat', () => {
    it('should detect PDF format', () => {
      expect(converter.detectFormat('document.pdf')).toBe(DocumentFormat.PDF);
    });

    it('should detect DOCX format', () => {
      expect(converter.detectFormat('document.docx')).toBe(DocumentFormat.DOCX);
    });

    it('should detect XLSX format', () => {
      expect(converter.detectFormat('spreadsheet.xlsx')).toBe(
        DocumentFormat.XLSX
      );
    });

    it('should detect PPTX format', () => {
      expect(converter.detectFormat('presentation.pptx')).toBe(
        DocumentFormat.PPTX
      );
    });

    it('should detect HTML format', () => {
      expect(converter.detectFormat('page.html')).toBe(DocumentFormat.HTML);
    });

    it('should detect TXT format', () => {
      expect(converter.detectFormat('note.txt')).toBe(DocumentFormat.TXT);
    });

    it('should return UNKNOWN for unsupported format', () => {
      expect(converter.detectFormat('file.xyz')).toBe(DocumentFormat.UNKNOWN);
    });
  });

  describe('isSupported', () => {
    it('should return true for supported formats', () => {
      expect(converter.isSupported('document.pdf')).toBe(true);
      expect(converter.isSupported('document.docx')).toBe(true);
      expect(converter.isSupported('spreadsheet.xlsx')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(converter.isSupported('file.xyz')).toBe(false);
      expect(converter.isSupported('file.mp3')).toBe(false);
    });
  });

  describe('getSupportedFormats', () => {
    it('should return array of supported formats', () => {
      const formats = converter.getSupportedFormats();
      expect(formats).toContain(DocumentFormat.PDF);
      expect(formats).toContain(DocumentFormat.DOCX);
      expect(formats).toContain(DocumentFormat.XLSX);
      expect(formats).toContain(DocumentFormat.PPTX);
      expect(formats).toContain(DocumentFormat.HTML);
      expect(formats).toContain(DocumentFormat.TXT);
      expect(formats.length).toBeGreaterThan(0);
    });
  });

  describe('convertBuffer', () => {
    it('should convert plain text buffer', async () => {
      const buffer = Buffer.from('Hello, World!');
      const result = await converter.convertBuffer(
        buffer,
        DocumentFormat.TXT
      );

      expect(result.markdown).toBe('Hello, World!');
      expect(result.metadata.format).toBe(DocumentFormat.TXT);
      expect(result.metadata.fileSize).toBe(13);
      expect(result.conversionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for unknown format', async () => {
      const buffer = Buffer.from('test');
      await expect(
        converter.convertBuffer(buffer, DocumentFormat.UNKNOWN)
      ).rejects.toThrow(ConversionError);
    });
  });

  describe('convertFile', () => {
    it('should throw error for non-existent file', async () => {
      await expect(
        converter.convertFile('./non-existent-file.pdf')
      ).rejects.toThrow();
    });

    it('should throw error for unsupported format', async () => {
      await expect(converter.convertFile('./test.xyz')).rejects.toThrow(
        ConversionError
      );
    });
  });
});

describe('ConversionError', () => {
  it('should create error with message', () => {
    const error = new ConversionError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ConversionError');
  });

  it('should store format and cause', () => {
    const cause = new Error('Original error');
    const error = new ConversionError('Test error', DocumentFormat.PDF, cause);
    expect(error.format).toBe(DocumentFormat.PDF);
    expect(error.cause).toBe(cause);
  });
});


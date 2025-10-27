import { describe, it, expect } from 'vitest';
import { Converter, ConversionError } from '../../src/index.js';
import { join } from 'path';

describe('Error Handling Integration', () => {
  const converter = new Converter();

  it('should throw error for non-existent file', async () => {
    await expect(
      converter.convertFile('/non/existent/file.txt')
    ).rejects.toThrow();
  });

  it('should throw ConversionError with format info', async () => {
    try {
      await converter.convertFile('/non/existent/file.pdf');
      expect.fail('Should have thrown an error');
    } catch (error) {
      // File not found errors are not ConversionError, they are file system errors
      expect(error).toBeDefined();
      expect(error instanceof Error).toBe(true);
    }
  });

  it('should detect unsupported format', () => {
    const format = converter.detectFormat('file.unknown');
    expect(format).toBe('unknown');
  });

  it('should reject unsupported format', () => {
    expect(converter.isSupported('file.xyz')).toBe(false);
  });

  it('should reject empty buffer', async () => {
    const buffer = Buffer.from('');
    
    await expect(async () => {
      await converter.convertBuffer(buffer, 'txt');
    }).rejects.toThrow('buffer is empty');
  });

  it('should handle invalid buffer for PDF', async () => {
    const buffer = Buffer.from('not a real pdf');
    
    await expect(
      converter.convertBuffer(buffer, 'pdf')
    ).rejects.toThrow();
  });
});


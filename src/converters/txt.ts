import { BaseConverter } from './base.js';
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from '../types.js';

/**
 * Plain text to Markdown converter
 */
export class TxtConverter extends BaseConverter {
  getFormat(): DocumentFormat {
    return DocumentFormat.TXT;
  }

  canHandle(extension: string): boolean {
    const ext = extension.toLowerCase();
    return (
      ext === 'txt' || ext === 'text' || ext === 'md' || ext === 'markdown'
    );
  }

  async convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();

    try {
      let text = buffer.toString('utf-8');

      // Clean up if preserveFormatting is enabled
      if (options?.preserveFormatting !== false) {
        text = this.cleanupText(text);
      }

      const metadata = this.createMetadata(DocumentFormat.TXT, buffer.length, {
        extra: {
          encoding: 'utf-8',
        },
      });

      return this.createResult(text, metadata, startTime);
    } catch (error) {
      throw new ConversionError(
        `Failed to convert TXT: ${error instanceof Error ? error.message : 'Unknown error'}`,
        DocumentFormat.TXT,
        error instanceof Error ? error : undefined
      );
    }
  }

  private cleanupText(text: string): string {
    // Normalize line endings
    text = text.replace(/\r\n/g, '\n');

    // Remove excessive blank lines (max 2 consecutive)
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  }
}

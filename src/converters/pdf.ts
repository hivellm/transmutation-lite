import * as pdfParse from 'pdf-parse';
import { BaseConverter } from './base.js';
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from '../types.js';

/**
 * PDF to Markdown converter using pdf-parse
 */
export class PdfConverter extends BaseConverter {
  getFormat(): DocumentFormat {
    return DocumentFormat.PDF;
  }

  canHandle(extension: string): boolean {
    return extension.toLowerCase() === 'pdf';
  }

  async convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      const data = await (pdfParse as any).default(buffer);

      let text = data.text;

      // Clean up the text
      if (options?.preserveFormatting !== false) {
        text = this.cleanupText(text);
      }

      // Apply page limit if specified
      if (options?.maxPages && options.maxPages > 0) {
        const pages = text.split('\f'); // Form feed separator
        text = pages.slice(0, options.maxPages).join('\n\n---\n\n');
        if (pages.length > options.maxPages) {
          warnings.push(
            `Only processed ${options.maxPages} of ${pages.length} pages`
          );
        }
      }

      const metadata = this.createMetadata(DocumentFormat.PDF, buffer.length, {
        pageCount: data.numpages,
        title: data.info?.Title,
        author: data.info?.Author,
        createdAt: data.info?.CreationDate
          ? new Date(data.info.CreationDate)
          : undefined,
        extra: {
          producer: data.info?.Producer,
          creator: data.info?.Creator,
        },
      });

      return this.createResult(text, metadata, startTime, warnings);
    } catch (error) {
      throw new ConversionError(
        `Failed to convert PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        DocumentFormat.PDF,
        error instanceof Error ? error : undefined
      );
    }
  }

  private cleanupText(text: string): string {
    // Remove excessive whitespace
    text = text.replace(/[ \t]+/g, ' ');

    // Normalize line breaks (max 2 consecutive)
    text = text.replace(/\n{3,}/g, '\n\n');

    // Remove form feed characters and replace with section breaks
    text = text.replace(/\f/g, '\n\n---\n\n');

    return text.trim();
  }
}


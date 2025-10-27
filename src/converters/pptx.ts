import * as XLSX from 'xlsx';
import { BaseConverter } from './base.js';
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from '../types.js';

/**
 * PPTX to Markdown converter
 * Note: Using a simplified approach with XLSX for XML parsing
 * For production use, consider a dedicated PPTX parser
 */
export class PptxConverter extends BaseConverter {
  getFormat(): DocumentFormat {
    return DocumentFormat.PPTX;
  }

  canHandle(extension: string): boolean {
    const ext = extension.toLowerCase();
    return ext === 'pptx' || ext === 'ppt';
  }

  async convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    warnings.push(
      'PPTX conversion is simplified and may not extract all content'
    );

    try {
      // For now, use a simple text extraction approach
      // In production, you'd want a proper PPTX parser
      const text = await this.extractTextFromPptx(buffer);

      const metadata = this.createMetadata(
        DocumentFormat.PPTX,
        buffer.length,
        {
          extra: {
            note: 'Basic text extraction only',
          },
        }
      );

      return this.createResult(text, metadata, startTime, warnings);
    } catch (error) {
      throw new ConversionError(
        `Failed to convert PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`,
        DocumentFormat.PPTX,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async extractTextFromPptx(buffer: Buffer): Promise<string> {
    // This is a very basic implementation
    // For production, use a proper PPTX parser library
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);

    let markdown = '# Presentation\n\n';
    markdown +=
      '*Note: This is a basic text extraction. For full PPTX support, use a dedicated parser.*\n\n';

    // Try to extract from slides
    const slideFiles = Object.keys(zip.files).filter((name) =>
      name.match(/ppt\/slides\/slide\d+\.xml/)
    );

    if (slideFiles.length === 0) {
      return markdown + '*No slides found*\n';
    }

    for (const slideFile of slideFiles.sort()) {
      const content = await zip.files[slideFile].async('text');

      // Extract text between <a:t> tags (very basic XML parsing)
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);

      if (textMatches) {
        const slideNum = slideFile.match(/slide(\d+)\.xml/)?.[1] || '?';
        markdown += `## Slide ${slideNum}\n\n`;

        const texts = textMatches
          .map((match) => match.replace(/<\/?a:t>/g, ''))
          .filter((text) => text.trim());

        markdown += texts.join('\n\n') + '\n\n';
      }
    }

    return markdown.trim();
  }
}


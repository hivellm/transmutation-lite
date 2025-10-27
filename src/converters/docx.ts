import mammoth from 'mammoth';
import { BaseConverter } from './base.js';
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from '../types.js';

/**
 * DOCX to Markdown converter using mammoth
 */
export class DocxConverter extends BaseConverter {
  getFormat(): DocumentFormat {
    return DocumentFormat.DOCX;
  }

  canHandle(extension: string): boolean {
    return extension.toLowerCase() === 'docx';
  }

  async convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      const result = await (mammoth as any).convertToMarkdown(
        { buffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => # :fresh",
            "p[style-name='Heading 2'] => ## :fresh",
            "p[style-name='Heading 3'] => ### :fresh",
            "p[style-name='Heading 4'] => #### :fresh",
            "p[style-name='Heading 5'] => ##### :fresh",
            "p[style-name='Heading 6'] => ###### :fresh",
          ],
        }
      );

      let markdown = result.value;

      // Collect warnings from mammoth
      if (result.messages.length > 0) {
        warnings.push(
          ...result.messages.map((msg: any) => `${msg.type}: ${msg.message}`)
        );
      }

      // Clean up the markdown
      if (options?.preserveFormatting !== false) {
        markdown = this.cleanupMarkdown(markdown);
      }

      const metadata = this.createMetadata(
        DocumentFormat.DOCX,
        buffer.length,
        {
          extra: {
            warnings: result.messages,
          },
        }
      );

      return this.createResult(markdown, metadata, startTime, warnings);
    } catch (error) {
      throw new ConversionError(
        `Failed to convert DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
        DocumentFormat.DOCX,
        error instanceof Error ? error : undefined
      );
    }
  }

  private cleanupMarkdown(markdown: string): string {
    // Remove excessive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace
    markdown = markdown.trim();

    return markdown;
  }
}


import TurndownService from 'turndown';
import { BaseConverter } from './base.js';
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from '../types.js';

/**
 * HTML to Markdown converter using turndown
 */
export class HtmlConverter extends BaseConverter {
  private turndown: TurndownService;

  constructor() {
    super();
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    });
  }

  getFormat(): DocumentFormat {
    return DocumentFormat.HTML;
  }

  canHandle(extension: string): boolean {
    const ext = extension.toLowerCase();
    return ext === 'html' || ext === 'htm';
  }

  async convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();

    try {
      const html = buffer.toString('utf-8');
      
      // Extract body content if present (for better compatibility with happy-dom)
      const bodyContent = this.extractBodyContent(html);
      let markdown = this.turndown.turndown(bodyContent);

      // Clean up if preserveFormatting is enabled
      if (options?.preserveFormatting !== false) {
        markdown = this.cleanupMarkdown(markdown);
      }

      const metadata = this.createMetadata(DocumentFormat.HTML, buffer.length, {
        title: this.extractTitle(html),
        extra: {
          encoding: 'utf-8',
        },
      });

      return this.createResult(markdown, metadata, startTime);
    } catch (error) {
      throw new ConversionError(
        `Failed to convert HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
        DocumentFormat.HTML,
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

  private extractTitle(html: string): string | undefined {
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : undefined;
  }

  private extractBodyContent(html: string): string {
    // Remove script and style tags first
    let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Try to extract content between <body> tags
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    
    // If no body tags, return as-is
    return content;
  }
}


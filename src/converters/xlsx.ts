import * as XLSX from 'xlsx';
import { BaseConverter } from './base.js';
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from '../types.js';

/**
 * XLSX to Markdown converter using xlsx library
 */
export class XlsxConverter extends BaseConverter {
  getFormat(): DocumentFormat {
    return DocumentFormat.XLSX;
  }

  canHandle(extension: string): boolean {
    const ext = extension.toLowerCase();
    return ext === 'xlsx' || ext === 'xls';
  }

  async convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      let markdown = '';
      let totalSheets = workbook.SheetNames.length;

      // Apply sheet limit if maxPages is specified
      const sheetsToProcess =
        options?.maxPages && options.maxPages > 0
          ? Math.min(options.maxPages, totalSheets)
          : totalSheets;

      if (sheetsToProcess < totalSheets) {
        warnings.push(
          `Only processed ${sheetsToProcess} of ${totalSheets} sheets`
        );
      }

      for (let i = 0; i < sheetsToProcess; i++) {
        const sheetName = workbook.SheetNames[i];
        const sheet = workbook.Sheets[sheetName];

        if (i > 0) {
          markdown += '\n\n---\n\n';
        }

        markdown += `# ${sheetName}\n\n`;

        // Convert sheet to markdown table
        const csvData = XLSX.utils.sheet_to_csv(sheet);

        if (csvData.trim()) {
          markdown += this.csvToMarkdownTable(csvData);
        } else {
          markdown += '*Empty sheet*\n';
          warnings.push(`Sheet "${sheetName}" is empty`);
        }
      }

      const metadata = this.createMetadata(
        DocumentFormat.XLSX,
        buffer.length,
        {
          pageCount: totalSheets,
          extra: {
            sheetNames: workbook.SheetNames,
            processedSheets: sheetsToProcess,
          },
        }
      );

      return this.createResult(markdown.trim(), metadata, startTime, warnings);
    } catch (error) {
      throw new ConversionError(
        `Failed to convert XLSX: ${error instanceof Error ? error.message : 'Unknown error'}`,
        DocumentFormat.XLSX,
        error instanceof Error ? error : undefined
      );
    }
  }

  private csvToMarkdownTable(csv: string): string {
    const lines = csv.split('\n').filter((line) => line.trim());

    if (lines.length === 0) {
      return '*No data*\n';
    }

    // Parse CSV (simple parser, doesn't handle all edge cases)
    const rows = lines.map((line) => this.parseCsvLine(line));

    if (rows.length === 0) {
      return '*No data*\n';
    }

    const maxCols = Math.max(...rows.map((row) => row.length));

    // Ensure all rows have the same number of columns
    rows.forEach((row) => {
      while (row.length < maxCols) {
        row.push('');
      }
    });

    let markdown = '';

    // Header row
    markdown += '| ' + rows[0].join(' | ') + ' |\n';

    // Separator
    markdown += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';

    // Data rows
    for (let i = 1; i < rows.length; i++) {
      markdown += '| ' + rows[i].join(' | ') + ' |\n';
    }

    return markdown;
  }

  private parseCsvLine(line: string): string[] {
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }

    cells.push(cell.trim());
    return cells;
  }
}


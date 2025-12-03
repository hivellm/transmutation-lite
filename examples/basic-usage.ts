import { Converter } from '../src/index.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Basic Usage Example
 * 
 * This example demonstrates the simplest way to convert documents
 * using transmutation-lite.
 */

async function basicConversion() {
  console.log('=== Basic Conversion ===\n');

  // Create a converter instance
  const converter = new Converter();

  // Convert a PDF file
  const pdfBuffer = readFileSync(join(__dirname, '../tests/test-fixtures/pdf/arxiv-2510.21695.pdf'));
  const pdfResult = await converter.convert(pdfBuffer, 'pdf');

  console.log('PDF Conversion Results:');
  console.log(`- Format: ${pdfResult.metadata.format}`);
  console.log(`- Pages: ${pdfResult.metadata.pageCount}`);
  console.log(`- File Size: ${(pdfResult.metadata.fileSize / 1024).toFixed(2)} KB`);
  console.log(`- Conversion Time: ${pdfResult.conversionTimeMs}ms`);
  console.log(`- Output Length: ${pdfResult.markdown.length} characters\n`);

  // Convert an HTML file
  const htmlBuffer = Buffer.from(`
    <!DOCTYPE html>
    <html>
      <head><title>Example</title></head>
      <body>
        <h1>Hello World</h1>
        <p>This is a <strong>simple</strong> HTML document.</p>
      </body>
    </html>
  `);
  const htmlResult = await converter.convert(htmlBuffer, 'html');

  console.log('HTML Conversion Results:');
  console.log(`- Format: ${htmlResult.metadata.format}`);
  console.log(`- Conversion Time: ${htmlResult.conversionTimeMs}ms`);
  console.log('- Markdown Output:\n');
  console.log(htmlResult.markdown);

  // Save the result
  writeFileSync('output.md', htmlResult.markdown);
  console.log('\nMarkdown saved to output.md');
}

basicConversion().catch(console.error);


import { Converter } from '../src/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Advanced Options Example
 * 
 * This example demonstrates the various conversion options
 * available in transmutation-lite.
 */

async function advancedOptions() {
  console.log('=== Advanced Options ===\n');

  const converter = new Converter();
  const pdfBuffer = readFileSync(join(__dirname, '../tests/test-fixtures/pdf/arxiv-2510.21618-deepagent.pdf'));

  // Example 1: Page Limiting
  console.log('1. Page Limiting');
  const limitedResult = await converter.convert(pdfBuffer, 'pdf', {
    maxPages: 3,
  });
  console.log(`   Limited to 3 pages: ${limitedResult.markdown.length} characters`);
  if (limitedResult.warnings && limitedResult.warnings.length > 0) {
    console.log(`   Warnings: ${limitedResult.warnings.join(', ')}`);
  }

  // Example 2: Preserve Original Formatting
  console.log('\n2. Formatting Options');
  const formattedResult = await converter.convert(pdfBuffer, 'pdf', {
    preserveFormatting: true,
  });
  console.log(`   With formatting preserved: ${formattedResult.markdown.length} characters`);

  const unformattedResult = await converter.convert(pdfBuffer, 'pdf', {
    preserveFormatting: false,
  });
  console.log(`   Without formatting cleanup: ${unformattedResult.markdown.length} characters`);

  // Example 3: HTML Conversion Options
  const htmlBuffer = Buffer.from(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Advanced Example</title>
        <style>body { color: red; }</style>
      </head>
      <body>
        <h1>Title</h1>
        <p>Paragraph with <em>emphasis</em> and <strong>bold</strong>.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <script>console.log('test');</script>
      </body>
    </html>
  `);

  console.log('\n3. HTML Conversion');
  const htmlResult = await converter.convert(htmlBuffer, 'html');
  console.log('   Converted HTML (scripts/styles removed):');
  console.log('   ' + htmlResult.markdown.split('\n').join('\n   '));

  // Example 4: Direct Buffer Conversion
  console.log('\n4. Direct Buffer Conversion');
  const txtBuffer = Buffer.from('# Simple Markdown\n\nThis is **bold** text.');
  const txtResult = await converter.convertBuffer(txtBuffer, 'txt');
  console.log(`   Buffer conversion: ${txtResult.markdown.length} characters`);
  console.log(`   Conversion time: ${txtResult.conversionTimeMs}ms`);

  // Example 5: Metadata Extraction
  console.log('\n5. Metadata Extraction');
  console.log('   PDF Metadata:');
  console.log(`   - Format: ${formattedResult.metadata.format}`);
  console.log(`   - File Size: ${(formattedResult.metadata.fileSize / 1024).toFixed(2)} KB`);
  console.log(`   - Pages: ${formattedResult.metadata.pageCount}`);
  if (formattedResult.metadata.title) {
    console.log(`   - Title: ${formattedResult.metadata.title}`);
  }
  if (formattedResult.metadata.author) {
    console.log(`   - Author: ${formattedResult.metadata.author}`);
  }
}

advancedOptions().catch(console.error);


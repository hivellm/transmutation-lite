import { Converter } from '../src/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Format Detection Example
 * 
 * This example shows how transmutation-lite can automatically
 * detect document formats from buffers.
 */

async function formatDetection() {
  console.log('=== Format Detection ===\n');

  const converter = new Converter();

  // Example 1: Auto-detect PDF
  const pdfBuffer = readFileSync(join(__dirname, '../tests/test-fixtures/pdf/arxiv-2510.21695.pdf'));
  const pdfFormat = converter.detectFormat(pdfBuffer);
  console.log(`PDF detected as: ${pdfFormat}`);

  // Example 2: Auto-detect HTML
  const htmlBuffer = Buffer.from('<!DOCTYPE html><html><body>Test</body></html>');
  const htmlFormat = converter.detectFormat(htmlBuffer);
  console.log(`HTML detected as: ${htmlFormat}`);

  // Example 3: Auto-detect plain text
  const txtBuffer = Buffer.from('This is plain text');
  const txtFormat = converter.detectFormat(txtBuffer);
  console.log(`Plain text detected as: ${txtFormat}`);

  // Example 4: Convert without specifying format
  console.log('\nConverting with auto-detection...');
  const result = await converter.convert(pdfBuffer);
  console.log(`Converted ${result.metadata.format} successfully`);
  console.log(`Pages: ${result.metadata.pageCount}`);
  console.log(`Size: ${(result.metadata.fileSize / 1024).toFixed(2)} KB`);
}

formatDetection().catch(console.error);


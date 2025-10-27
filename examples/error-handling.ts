import { Converter, ConversionError } from '../src/index.js';
import { readFileSync } from 'fs';

/**
 * Error Handling Example
 * 
 * This example demonstrates proper error handling when
 * converting documents with transmutation-lite.
 */

async function errorHandling() {
  console.log('=== Error Handling ===\n');

  const converter = new Converter();

  // Example 1: Invalid Format
  console.log('1. Invalid Format');
  try {
    await converter.convert(Buffer.from('test'), 'invalid-format' as any);
  } catch (error) {
    if (error instanceof ConversionError) {
      console.log(`   ✓ Caught ConversionError: ${error.message}`);
    }
  }

  // Example 2: Corrupted PDF
  console.log('\n2. Corrupted PDF');
  try {
    const corruptedPdf = Buffer.from('Not a real PDF file');
    await converter.convert(corruptedPdf, 'pdf');
  } catch (error) {
    if (error instanceof ConversionError) {
      console.log(`   ✓ Caught ConversionError: ${error.message}`);
    }
  }

  // Example 3: Empty Buffer
  console.log('\n3. Empty Buffer');
  try {
    await converter.convert(Buffer.from(''), 'txt');
  } catch (error) {
    if (error instanceof ConversionError) {
      console.log(`   ✓ Caught ConversionError: ${error.message}`);
    } else {
      // Empty TXT might succeed with empty output
      console.log('   ✓ Empty buffer handled gracefully');
    }
  }

  // Example 4: File Not Found (if reading from disk)
  console.log('\n4. File Not Found');
  try {
    readFileSync('nonexistent-file.pdf');
  } catch (error) {
    console.log(`   ✓ Caught File System Error: ${(error as Error).message.split('\n')[0]}`);
  }

  // Example 5: Successful Conversion with Warnings
  console.log('\n5. Conversion with Warnings');
  try {
    const htmlBuffer = Buffer.from('<html><body><h1>Test</h1></body></html>');
    const result = await converter.convert(htmlBuffer, 'html');
    
    console.log('   ✓ Conversion successful');
    if (result.warnings && result.warnings.length > 0) {
      console.log(`   ⚠ Warnings: ${result.warnings.join(', ')}`);
    } else {
      console.log('   ✓ No warnings');
    }
  } catch (error) {
    console.error('   ✗ Unexpected error:', error);
  }

  // Example 6: Best Practice - Try-Catch with Logging
  console.log('\n6. Best Practice Example');
  async function safeConvert(buffer: Buffer, format: string) {
    try {
      const result = await converter.convert(buffer, format as any);
      
      // Log success
      console.log(`   ✓ Converted ${format.toUpperCase()} successfully`);
      console.log(`   - Size: ${buffer.length} bytes`);
      console.log(`   - Output: ${result.markdown.length} characters`);
      console.log(`   - Time: ${result.conversionTimeMs}ms`);
      
      // Check for warnings
      if (result.warnings && result.warnings.length > 0) {
        console.warn(`   ⚠ Warnings: ${result.warnings.join(', ')}`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ConversionError) {
        console.error(`   ✗ Conversion failed: ${error.message}`);
      } else {
        console.error(`   ✗ Unexpected error: ${error}`);
      }
      throw error;
    }
  }

  const testBuffer = Buffer.from('# Test Document\n\nThis is a test.');
  await safeConvert(testBuffer, 'txt');
}

errorHandling().catch(console.error);


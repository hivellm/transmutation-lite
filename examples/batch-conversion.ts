import { Converter } from '../src/index.js';
import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

/**
 * Batch Conversion Example
 * 
 * This example demonstrates how to convert multiple files
 * in parallel using Promise.all.
 */

async function batchConversion() {
  console.log('=== Batch Conversion ===\n');

  const converter = new Converter();
  const fixturesDir = join(__dirname, '../tests/test-fixtures');

  // Get all files from test fixtures
  const files: { path: string; format: string }[] = [];
  
  // Scan directories
  const dirs = ['html', 'txt'];
  for (const dir of dirs) {
    const dirPath = join(fixturesDir, dir);
    try {
      const dirFiles = readdirSync(dirPath);
      for (const file of dirFiles) {
        const filePath = join(dirPath, file);
        if (statSync(filePath).isFile() && file !== 'README.md') {
          files.push({ path: filePath, format: dir });
        }
      }
    } catch (err) {
      // Directory doesn't exist, skip
    }
  }

  console.log(`Found ${files.length} files to convert\n`);

  // Convert all files in parallel
  const startTime = Date.now();
  
  const results = await Promise.all(
    files.map(async ({ path, format }) => {
      const buffer = readFileSync(path);
      const result = await converter.convert(buffer, format as any);
      return {
        file: basename(path),
        format: result.metadata.format,
        size: result.metadata.fileSize,
        time: result.conversionTimeMs,
        outputLength: result.markdown.length,
      };
    })
  );

  const totalTime = Date.now() - startTime;

  // Display results
  console.log('Conversion Results:');
  console.log('='.repeat(70));
  for (const result of results) {
    console.log(`${result.file.padEnd(30)} | ${result.format.padEnd(8)} | ${result.time.toString().padStart(5)}ms | ${result.outputLength.toString().padStart(7)} chars`);
  }
  console.log('='.repeat(70));
  console.log(`\nTotal: ${results.length} files in ${totalTime}ms`);
  console.log(`Average: ${(totalTime / results.length).toFixed(2)}ms per file`);

  // Save combined output
  const combined = results
    .map(r => `# ${r.file}\n\n${r.format}\n`)
    .join('\n---\n\n');
  
  writeFileSync('batch-output.md', combined);
  console.log('\nCombined output saved to batch-output.md');
}

batchConversion().catch(console.error);


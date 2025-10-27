#!/usr/bin/env node

import { Command } from 'commander';
import { readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, basename, extname, dirname } from 'path';
import { Converter } from './index.js';
import type { ConversionOptions } from './types.js';

const program = new Command();

program
  .name('transmutation-lite')
  .description('Simplified document converter for PDF, DOCX, XLSX, PPTX to Markdown')
  .version('0.1.0');

program
  .command('convert <file>')
  .description('Convert a single file to Markdown')
  .option('-o, --output <path>', 'Output file path (default: <filename>.md)')
  .option('-m, --max-pages <number>', 'Maximum pages/sheets to process', parseInt)
  .option('--no-preserve-formatting', 'Disable formatting preservation')
  .action(async (file: string, options) => {
    try {
      const converter = new Converter();

      if (!converter.isSupported(file)) {
        console.error(`❌ Unsupported file format: ${extname(file)}`);
        process.exit(1);
      }

      console.log(`📄 Converting: ${basename(file)}`);

      const conversionOptions: ConversionOptions = {
        preserveFormatting: options.preserveFormatting,
        maxPages: options.maxPages,
      };

      const result = await converter.convertFile(file, conversionOptions);

      // Determine output path
      const outputPath =
        options.output ||
        file.replace(/\.[^.]+$/, '.md');

      // Ensure output directory exists
      await mkdir(dirname(outputPath), { recursive: true });

      // Write markdown to file
      await writeFile(outputPath, result.markdown, 'utf-8');

      console.log(`✅ Converted successfully!`);
      console.log(`   Format: ${result.metadata.format}`);
      console.log(`   Pages: ${result.metadata.pageCount || 'N/A'}`);
      console.log(`   Time: ${result.conversionTimeMs}ms`);
      console.log(`   Output: ${outputPath}`);

      if (result.warnings && result.warnings.length > 0) {
        console.log(`⚠️  Warnings:`);
        result.warnings.forEach((warning) => console.log(`   - ${warning}`));
      }
    } catch (error) {
      console.error(
        `❌ Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      process.exit(1);
    }
  });

program
  .command('batch <directory>')
  .description('Convert all supported files in a directory')
  .option('-o, --output <path>', 'Output directory (default: <directory>/output)')
  .option('-r, --recursive', 'Process subdirectories recursively')
  .option('-m, --max-pages <number>', 'Maximum pages/sheets to process', parseInt)
  .option('--parallel <number>', 'Number of parallel conversions', parseInt, 4)
  .option('--no-preserve-formatting', 'Disable formatting preservation')
  .action(async (directory: string, options) => {
    try {
      const converter = new Converter();
      const files = await findFiles(directory, options.recursive);

      const supportedFiles = files.filter((file) => converter.isSupported(file));

      if (supportedFiles.length === 0) {
        console.log('❌ No supported files found');
        process.exit(1);
      }

      console.log(`📁 Found ${supportedFiles.length} supported files`);

      const outputDir = options.output || join(directory, 'output');
      await mkdir(outputDir, { recursive: true });

      const conversionOptions: ConversionOptions = {
        preserveFormatting: options.preserveFormatting,
        maxPages: options.maxPages,
      };

      let completed = 0;
      let failed = 0;

      // Process files in batches for parallelism
      const batchSize = options.parallel;

      for (let i = 0; i < supportedFiles.length; i += batchSize) {
        const batch = supportedFiles.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (file) => {
            try {
              const result = await converter.convertFile(
                file,
                conversionOptions
              );

              const relativePath = file.replace(directory, '').replace(/^[/\\]/, '');
              const outputPath = join(
                outputDir,
                relativePath.replace(/\.[^.]+$/, '.md')
              );

              await mkdir(dirname(outputPath), { recursive: true });
              await writeFile(outputPath, result.markdown, 'utf-8');

              completed++;
              console.log(
                `✅ [${completed}/${supportedFiles.length}] ${basename(file)} (${result.conversionTimeMs}ms)`
              );
            } catch (error) {
              failed++;
              console.error(
                `❌ [${completed + failed}/${supportedFiles.length}] ${basename(file)}: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          })
        );
      }

      console.log(`\n📊 Summary:`);
      console.log(`   Total: ${supportedFiles.length}`);
      console.log(`   Success: ${completed}`);
      console.log(`   Failed: ${failed}`);
      console.log(`   Output: ${outputDir}`);

      if (failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error(
        `❌ Batch conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      process.exit(1);
    }
  });

program
  .command('formats')
  .description('List supported file formats')
  .action(() => {
    const converter = new Converter();
    const formats = converter.getSupportedFormats();

    console.log('📋 Supported formats:');
    formats.forEach((format) => {
      console.log(`   - ${format.toUpperCase()}`);
    });
  });

async function findFiles(
  dir: string,
  recursive: boolean = false
): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory() && recursive) {
      const subFiles = await findFiles(fullPath, recursive);
      files.push(...subFiles);
    } else if (stats.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

program.parse();


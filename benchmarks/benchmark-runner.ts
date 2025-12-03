import { Converter } from '../src/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

interface BenchmarkResult {
  format: string;
  file: string;
  fileSize: number;
  runs: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  throughput: number; // bytes per second
  memoryUsed?: number;
}

/**
 * Performance Benchmark Runner
 * 
 * Tests conversion performance across different formats and file sizes.
 */
export class BenchmarkRunner {
  private converter: Converter;
  private results: BenchmarkResult[] = [];

  constructor() {
    this.converter = new Converter();
  }

  /**
   * Run a benchmark for a specific file
   */
  async benchmarkFile(
    filePath: string,
    format: string,
    runs: number = 10
  ): Promise<BenchmarkResult> {
    const buffer = readFileSync(filePath);
    const times: number[] = [];
    let memoryBefore = 0;
    let memoryAfter = 0;

    // Warm up
    await this.converter.convert(buffer, format as any);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      memoryBefore = process.memoryUsage().heapUsed;
    }

    // Run benchmarks
    for (let i = 0; i < runs; i++) {
      const startTime = performance.now();
      await this.converter.convert(buffer, format as any);
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    if (global.gc) {
      memoryAfter = process.memoryUsage().heapUsed;
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = (buffer.length / avgTime) * 1000; // bytes per second

    const result: BenchmarkResult = {
      format,
      file: filePath.split(/[\\/]/).pop() || filePath,
      fileSize: buffer.length,
      runs,
      avgTime,
      minTime,
      maxTime,
      throughput,
      memoryUsed: global.gc ? memoryAfter - memoryBefore : undefined,
    };

    this.results.push(result);
    return result;
  }

  /**
   * Run benchmarks for all test fixtures
   */
  async benchmarkAll(runs: number = 10): Promise<void> {
    console.log('🚀 Starting Performance Benchmarks\n');
    console.log(`Runs per test: ${runs}`);
    console.log('='.repeat(80));

    const fixtures = [
      // HTML files
      { path: 'tests/test-fixtures/html/simple.html', format: 'html' },
      { path: 'tests/test-fixtures/html/complex.html', format: 'html' },
      
      // TXT files
      { path: 'tests/test-fixtures/txt/simple.txt', format: 'txt' },
      { path: 'tests/test-fixtures/txt/with-metadata.txt', format: 'txt' },
      
      // PDF files
      { path: 'tests/test-fixtures/pdf/arxiv-2510.21695.pdf', format: 'pdf' },
      { path: 'tests/test-fixtures/pdf/arxiv-2510.21618-deepagent.pdf', format: 'pdf' },
    ];

    for (const fixture of fixtures) {
      try {
        const fullPath = join(process.cwd(), fixture.path);
        const result = await this.benchmarkFile(fullPath, fixture.format, runs);
        this.printResult(result);
      } catch (error) {
        console.log(`⚠ Skipped ${fixture.path}: ${(error as Error).message}`);
      }
    }

    console.log('='.repeat(80));
    this.printSummary();
  }

  /**
   * Print a single benchmark result
   */
  private printResult(result: BenchmarkResult): void {
    const sizeKB = (result.fileSize / 1024).toFixed(2);
    const throughputMBps = (result.throughput / (1024 * 1024)).toFixed(2);
    
    console.log(`\n📄 ${result.file}`);
    console.log(`   Format: ${result.format.toUpperCase()}`);
    console.log(`   Size: ${sizeKB} KB`);
    console.log(`   Avg Time: ${result.avgTime.toFixed(2)}ms`);
    console.log(`   Min/Max: ${result.minTime.toFixed(2)}ms / ${result.maxTime.toFixed(2)}ms`);
    console.log(`   Throughput: ${throughputMBps} MB/s`);
    
    if (result.memoryUsed !== undefined) {
      const memoryMB = (result.memoryUsed / (1024 * 1024)).toFixed(2);
      console.log(`   Memory: ${memoryMB} MB`);
    }
  }

  /**
   * Print summary statistics
   */
  private printSummary(): void {
    if (this.results.length === 0) return;

    console.log('\n📊 Summary Statistics\n');

    // Group by format
    const byFormat = new Map<string, BenchmarkResult[]>();
    for (const result of this.results) {
      if (!byFormat.has(result.format)) {
        byFormat.set(result.format, []);
      }
      byFormat.get(result.format)!.push(result);
    }

    for (const [format, results] of byFormat) {
      const avgTime = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;
      const avgThroughput = results.reduce((sum, r) => sum + r.throughput, 0) / results.length;
      const throughputMBps = (avgThroughput / (1024 * 1024)).toFixed(2);

      console.log(`${format.toUpperCase()}:`);
      console.log(`  Average Time: ${avgTime.toFixed(2)}ms`);
      console.log(`  Average Throughput: ${throughputMBps} MB/s`);
      console.log(`  Files Tested: ${results.length}`);
      console.log();
    }

    // Overall stats
    const totalTime = this.results.reduce((sum, r) => sum + r.avgTime, 0);
    const totalSize = this.results.reduce((sum, r) => sum + r.fileSize, 0);
    const overallThroughput = (totalSize / totalTime) * 1000;
    const throughputMBps = (overallThroughput / (1024 * 1024)).toFixed(2);

    console.log('OVERALL:');
    console.log(`  Total Files: ${this.results.length}`);
    console.log(`  Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`  Average Throughput: ${throughputMBps} MB/s`);
  }

  /**
   * Export results to JSON
   */
  exportResults(outputPath: string): void {
    const fs = require('fs');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          platform: process.platform,
          nodeVersion: process.version,
          results: this.results,
        },
        null,
        2
      )
    );
    console.log(`\n✅ Results exported to ${outputPath}`);
  }

  /**
   * Get all results
   */
  getResults(): BenchmarkResult[] {
    return this.results;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new BenchmarkRunner();
  const runs = parseInt(process.argv[2] || '10', 10);
  
  runner.benchmarkAll(runs).then(() => {
    runner.exportResults('benchmarks/results.json');
  }).catch(console.error);
}


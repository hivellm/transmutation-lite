import { readFileSync } from 'fs';

/**
 * Compare benchmark results from different runs
 */

interface BenchmarkData {
  timestamp: string;
  platform: string;
  nodeVersion: string;
  results: Array<{
    format: string;
    file: string;
    fileSize: number;
    avgTime: number;
    throughput: number;
  }>;
}

function compareBenchmarks(file1: string, file2: string): void {
  const data1: BenchmarkData = JSON.parse(readFileSync(file1, 'utf-8'));
  const data2: BenchmarkData = JSON.parse(readFileSync(file2, 'utf-8'));

  console.log('📊 Benchmark Comparison\n');
  console.log(`Baseline: ${data1.timestamp} (${data1.nodeVersion})`);
  console.log(`Current:  ${data2.timestamp} (${data2.nodeVersion})`);
  console.log('='.repeat(80));

  // Create map for easier comparison
  const baseline = new Map(
    data1.results.map(r => [`${r.format}:${r.file}`, r])
  );
  const current = new Map(
    data2.results.map(r => [`${r.format}:${r.file}`, r])
  );

  console.log('\n📈 Performance Changes:\n');
  console.log('File'.padEnd(40) + 'Baseline'.padEnd(15) + 'Current'.padEnd(15) + 'Change');
  console.log('-'.repeat(80));

  for (const [key, baseResult] of baseline) {
    const currResult = current.get(key);
    if (!currResult) continue;

    const timeDiff = ((currResult.avgTime - baseResult.avgTime) / baseResult.avgTime) * 100;
    const symbol = timeDiff < -5 ? '🚀' : timeDiff > 5 ? '🐌' : '✓';
    const sign = timeDiff > 0 ? '+' : '';

    console.log(
      `${symbol} ${baseResult.file.padEnd(35)}` +
      `${baseResult.avgTime.toFixed(1)}ms`.padEnd(15) +
      `${currResult.avgTime.toFixed(1)}ms`.padEnd(15) +
      `${sign}${timeDiff.toFixed(1)}%`
    );
  }

  // Summary
  const baseAvg = data1.results.reduce((sum, r) => sum + r.avgTime, 0) / data1.results.length;
  const currAvg = data2.results.reduce((sum, r) => sum + r.avgTime, 0) / data2.results.length;
  const overallChange = ((currAvg - baseAvg) / baseAvg) * 100;

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Overall Change:');
  console.log(`   Baseline Average: ${baseAvg.toFixed(2)}ms`);
  console.log(`   Current Average:  ${currAvg.toFixed(2)}ms`);
  console.log(`   Change: ${overallChange > 0 ? '+' : ''}${overallChange.toFixed(1)}%`);

  if (overallChange < -5) {
    console.log('\n🎉 Performance improved!');
  } else if (overallChange > 5) {
    console.log('\n⚠️  Performance degraded!');
  } else {
    console.log('\n✓ Performance stable');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const [file1, file2] = process.argv.slice(2);
  
  if (!file1 || !file2) {
    console.error('Usage: tsx benchmarks/compare.ts <baseline.json> <current.json>');
    process.exit(1);
  }

  compareBenchmarks(file1, file2);
}


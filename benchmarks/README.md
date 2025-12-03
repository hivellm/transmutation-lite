# Performance Benchmarks

This directory contains performance benchmarking tools for Transmutation Lite.

## Running Benchmarks

### Quick Start

Run benchmarks with default settings (10 runs per test):

```bash
npm run benchmark
```

Run with custom number of runs:

```bash
tsx benchmarks/benchmark-runner.ts 20
```

### With Garbage Collection Stats

For more accurate memory measurements, run with the `--expose-gc` flag:

```bash
node --expose-gc --loader tsx benchmarks/benchmark-runner.ts
```

## Benchmark Results

Results are automatically saved to `benchmarks/results.json` with:
- Timestamp
- Platform information
- Node.js version
- Detailed metrics for each test

### Metrics Collected

For each conversion:
- **Average Time**: Mean conversion time across all runs
- **Min/Max Time**: Best and worst times
- **Throughput**: Bytes processed per second (MB/s)
- **Memory Used**: Heap memory delta (if GC available)
- **File Size**: Input file size

## Comparing Results

Compare two benchmark runs to track performance changes:

```bash
tsx benchmarks/compare.ts benchmarks/baseline.json benchmarks/results.json
```

This will show:
- Performance changes for each test
- Overall performance trend
- Regressions or improvements

## Interpreting Results

### Good Performance Indicators

- **HTML**: > 10 MB/s for small files, > 5 MB/s for large
- **TXT**: > 50 MB/s (very fast, minimal processing)
- **PDF**: > 1 MB/s for text-heavy PDFs

### Performance Tips

1. **Batch Processing**: Use `Promise.all()` for parallel conversions
2. **Caching**: Reuse `Converter` instance instead of creating new ones
3. **Memory**: For large files, convert in chunks if possible
4. **Warm-up**: First conversion may be slower due to module loading

## Sample Output

```
🚀 Starting Performance Benchmarks

Runs per test: 10
================================================================================

📄 simple.html
   Format: HTML
   Size: 0.45 KB
   Avg Time: 2.34ms
   Min/Max: 1.89ms / 3.12ms
   Throughput: 15.23 MB/s

📄 arxiv-2510.21695.pdf
   Format: PDF
   Size: 1234.56 KB
   Avg Time: 456.78ms
   Min/Max: 423.45ms / 489.12ms
   Throughput: 2.70 MB/s

================================================================================

📊 Summary Statistics

HTML:
  Average Time: 3.45ms
  Average Throughput: 12.34 MB/s
  Files Tested: 2

PDF:
  Average Time: 567.89ms
  Average Throughput: 2.15 MB/s
  Files Tested: 2

OVERALL:
  Total Files: 6
  Total Size: 3456.78 KB
  Average Throughput: 5.67 MB/s

✅ Results exported to benchmarks/results.json
```

## Automated Benchmarking

Benchmarks can be integrated into CI/CD to track performance over time:

```yaml
# .github/workflows/benchmark.yml
- name: Run Benchmarks
  run: npm run benchmark

- name: Compare with Baseline
  run: tsx benchmarks/compare.ts baseline.json results.json
```

## Baseline Results

Keep a baseline result file for comparison:

```bash
# Create baseline
npm run benchmark
cp benchmarks/results.json benchmarks/baseline.json

# After changes, compare
npm run benchmark
tsx benchmarks/compare.ts benchmarks/baseline.json benchmarks/results.json
```

## Contributing

When adding new converters or optimizations:
1. Run benchmarks before changes
2. Save as baseline
3. Implement changes
4. Run benchmarks again
5. Compare results
6. Document significant changes


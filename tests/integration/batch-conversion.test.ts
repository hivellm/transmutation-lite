import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Converter } from '../../src/index.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('Batch Conversion Integration', () => {
  const testDir = join(process.cwd(), 'tests/temp-integration');
  const outputDir = join(testDir, 'output');

  beforeEach(() => {
    // Create temp directories
    mkdirSync(testDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    // Create sample files
    writeFileSync(join(testDir, 'file1.txt'), 'Content 1');
    writeFileSync(join(testDir, 'file2.txt'), 'Content 2');
    writeFileSync(join(testDir, 'file3.html'), '<h1>HTML Content</h1>');
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should convert multiple files', async () => {
    const converter = new Converter();
    const files = ['file1.txt', 'file2.txt'];
    const results = [];

    for (const file of files) {
      const result = await converter.convertFile(join(testDir, file));
      results.push(result);
    }

    expect(results).toHaveLength(2);
    expect(results[0].markdown).toContain('Content 1');
    expect(results[1].markdown).toContain('Content 2');
  });

  it('should handle mixed format conversion', async () => {
    const converter = new Converter();

    const txtResult = await converter.convertFile(join(testDir, 'file1.txt'));
    const htmlResult = await converter.convertFile(join(testDir, 'file3.html'));

    expect(txtResult.metadata.format).toBe('txt');
    expect(htmlResult.metadata.format).toBe('html');
    expect(htmlResult.markdown).toContain('HTML Content');
  });

  it('should track total conversion time', async () => {
    const converter = new Converter();
    const startTime = Date.now();

    await converter.convertFile(join(testDir, 'file1.txt'));
    await converter.convertFile(join(testDir, 'file2.txt'));
    await converter.convertFile(join(testDir, 'file3.html'));

    const totalTime = Date.now() - startTime;

    expect(totalTime).toBeGreaterThan(0);
    expect(totalTime).toBeLessThan(1000); // Should be fast
  });
});

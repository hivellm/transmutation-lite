# Transmutation Lite Examples

This directory contains comprehensive examples demonstrating various features of transmutation-lite.

## Running Examples

All examples are written in TypeScript and can be run using `tsx`:

```bash
npm install -g tsx
tsx examples/basic-usage.ts
```

Or using the TypeScript compiler:

```bash
npm run build
node dist/examples/basic-usage.js
```

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)

The simplest way to get started with transmutation-lite. Shows:
- Creating a converter instance
- Converting PDF and HTML documents
- Accessing conversion results and metadata
- Saving output to files

**Run:** `tsx examples/basic-usage.ts`

### 2. Format Detection (`format-detection.ts`)

Demonstrates automatic format detection from buffer content. Shows:
- Auto-detecting PDF, HTML, and TXT formats
- Using `detectFormat()` method
- Converting without explicitly specifying format
- Format detection accuracy

**Run:** `tsx examples/format-detection.ts`

### 3. Batch Conversion (`batch-conversion.ts`)

Shows how to efficiently convert multiple files in parallel. Features:
- Processing multiple files simultaneously
- Using `Promise.all()` for parallel execution
- Collecting and displaying batch results
- Performance metrics and statistics
- Combining outputs into a single file

**Run:** `tsx examples/batch-conversion.ts`

### 4. Advanced Options (`advanced-options.ts`)

Explores all available conversion options. Covers:
- Page limiting for PDFs
- Formatting preservation options
- HTML conversion with script/style removal
- Direct buffer conversion
- Metadata extraction from various formats
- Comparing different option configurations

**Run:** `tsx examples/advanced-options.ts`

### 5. Error Handling (`error-handling.ts`)

Best practices for handling errors during conversion. Demonstrates:
- Catching `ConversionError` exceptions
- Handling invalid formats and corrupted files
- Managing file system errors
- Processing warnings
- Implementing safe conversion wrappers
- Logging and error reporting patterns

**Run:** `tsx examples/error-handling.ts`

## Common Patterns

### Creating a Converter

```typescript
import { Converter } from 'transmutation-lite';

const converter = new Converter();
```

### Converting a File

```typescript
import { readFileSync } from 'fs';

const buffer = readFileSync('document.pdf');
const result = await converter.convert(buffer, 'pdf');
console.log(result.markdown);
```

### Auto-Detecting Format

```typescript
const buffer = readFileSync('document.pdf');
const format = converter.detectFormat(buffer);
const result = await converter.convert(buffer, format);
```

### Batch Processing

```typescript
const files = ['doc1.pdf', 'doc2.html', 'doc3.txt'];
const results = await Promise.all(
  files.map(async (file) => {
    const buffer = readFileSync(file);
    return converter.convert(buffer);
  })
);
```

### Error Handling

```typescript
try {
  const result = await converter.convert(buffer, 'pdf');
  console.log(result.markdown);
} catch (error) {
  if (error instanceof ConversionError) {
    console.error('Conversion failed:', error.message);
  }
}
```

## Next Steps

- Read the [API Documentation](../docs/API.md)
- Explore [CLI Usage](../docs/CLI.md)
- Check out [Supported Formats](../docs/FORMATS.md)
- Review the [main README](../README.md)

## Contributing

Have a useful example to share? Please open a PR! Good examples should:
- Be concise and focused on one feature
- Include clear comments explaining the code
- Use realistic use cases
- Handle errors appropriately
- Follow TypeScript best practices


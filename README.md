# Transmutation Lite

> Simplified TypeScript document converter for common formats to Markdown

**Version:** 0.1.0  
**Status:** ✅ Production Ready

## Overview

Transmutation Lite is a lightweight, TypeScript-based document conversion library that converts common document formats (PDF, DOCX, XLSX, PPTX, HTML, TXT) to Markdown. Designed specifically for integration with the HiveLLM Classify project, it provides fast, reliable conversions without the complexity of OCR, audio, video, or archive processing.

> **⚠️ Important**: This is a **simplified version** optimized for use cases that **do not require high precision**, such as document classification. For production applications requiring high-quality conversion, advanced features, and superior performance, we **strongly recommend** using the full [Transmutation](https://github.com/hivellm/transmutation) Rust library, which offers:
> - **98x faster** performance than Docling
> - **80%+ conversion quality** with precision mode
> - Advanced OCR, audio, and video processing
> - Enterprise-grade reliability and accuracy
> 
> **Use Transmutation Lite for**: Document classification, quick previews, prototyping  
> **Use Transmutation (Rust) for**: RAG systems, production pipelines, high-quality document processing

## Features

- ✅ **PDF to Markdown** - Using `pdf-parse` for text extraction
- ✅ **DOCX to Markdown** - Using `mammoth` for Word documents
- ✅ **XLSX to Markdown** - Using `xlsx` for Excel spreadsheets (tables)
- ✅ **PPTX to Markdown** - Basic text extraction from PowerPoint
- ✅ **HTML to Markdown** - Using `turndown` for clean conversion
- ✅ **TXT to Markdown** - Plain text normalization
- ✅ **CLI & Library** - Use as command-line tool or Node.js library
- ✅ **TypeScript** - Full type safety and IntelliSense support
- ✅ **Fast & Lightweight** - No heavy dependencies or external tools
- ✅ **Batch Processing** - Convert multiple files in parallel

## Quick Start

### Installation

```bash
npm install @hivellm/transmutation-lite
```

### Library Usage

```typescript
import { convert, Converter } from '@hivellm/transmutation-lite';

// Simple conversion
const result = await convert('./document.pdf');
console.log(result.markdown);

// With options
const converter = new Converter();
const result = await converter.convertFile('./document.docx', {
  preserveFormatting: true,
  maxPages: 10,
});

console.log('Format:', result.metadata.format);
console.log('Pages:', result.metadata.pageCount);
console.log('Time:', result.conversionTimeMs, 'ms');
console.log('Markdown:', result.markdown);
```

### CLI Usage

```bash
# Convert single file
npx transmutation-lite convert document.pdf -o output.md

# Convert with options
npx transmutation-lite convert report.docx -o report.md --max-pages 5

# Batch conversion
npx transmutation-lite batch ./documents -o ./output --parallel 4

# Recursive batch conversion
npx transmutation-lite batch ./docs -o ./markdown --recursive

# List supported formats
npx transmutation-lite formats
```

## API Reference

### `convert(filePath, options?)`

Convenience function to convert a single file.

**Parameters:**
- `filePath` (string): Path to the file to convert
- `options` (ConversionOptions): Optional conversion options

**Returns:** `Promise<ConversionResult>`

```typescript
const result = await convert('./document.pdf', {
  preserveFormatting: true,
  maxPages: 10,
});
```

### `Converter` Class

Main converter class that manages all format converters.

#### Methods

##### `convertFile(filePath, options?)`

Convert a file to Markdown.

```typescript
const converter = new Converter();
const result = await converter.convertFile('./document.docx');
```

##### `convertBuffer(buffer, format, options?)`

Convert a buffer directly.

```typescript
const buffer = await readFile('./document.pdf');
const result = await converter.convertBuffer(buffer, DocumentFormat.PDF);
```

##### `detectFormat(filePath)`

Detect document format from file extension.

```typescript
const format = converter.detectFormat('./document.pdf');
// Returns: DocumentFormat.PDF
```

##### `isSupported(filePath)`

Check if a file format is supported.

```typescript
const supported = converter.isSupported('./document.pdf');
// Returns: true
```

##### `getSupportedFormats()`

Get list of supported formats.

```typescript
const formats = converter.getSupportedFormats();
// Returns: [DocumentFormat.PDF, DocumentFormat.DOCX, ...]
```

### Types

#### `ConversionOptions`

```typescript
interface ConversionOptions {
  preserveFormatting?: boolean;  // Default: true
  extractImages?: boolean;        // Default: false (not implemented)
  maxPages?: number;              // Default: 0 (all pages)
  formatOptions?: Record<string, any>;
}
```

#### `ConversionResult`

```typescript
interface ConversionResult {
  markdown: string;               // Converted markdown content
  metadata: DocumentMetadata;     // Document metadata
  conversionTimeMs: number;       // Conversion time in milliseconds
  warnings?: string[];            // Any warnings during conversion
}
```

#### `DocumentMetadata`

```typescript
interface DocumentMetadata {
  format: DocumentFormat;         // Original format
  fileSize: number;               // File size in bytes
  pageCount?: number;             // Number of pages/sheets/slides
  title?: string;                 // Document title
  author?: string;                // Document author
  createdAt?: Date;               // Creation date
  extra?: Record<string, any>;    // Format-specific metadata
}
```

#### `DocumentFormat` Enum

```typescript
enum DocumentFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  XLSX = 'xlsx',
  PPTX = 'pptx',
  TXT = 'txt',
  HTML = 'html',
  UNKNOWN = 'unknown',
}
```

## Supported Formats

| Format | Extension | Library | Quality | Notes |
|--------|-----------|---------|---------|-------|
| PDF | `.pdf` | pdf-parse | Good | Text extraction only, no images |
| DOCX | `.docx` | mammoth | Excellent | Full formatting support |
| XLSX | `.xlsx`, `.xls` | xlsx | Excellent | Converts to Markdown tables |
| PPTX | `.pptx`, `.ppt` | jszip (basic) | Fair | Basic text extraction |
| HTML | `.html`, `.htm` | turndown | Excellent | Clean Markdown conversion |
| TXT | `.txt`, `.md` | native | Perfect | Direct text handling |

## Integration with Classify

Transmutation Lite is designed to integrate seamlessly with the HiveLLM Classify project:

```typescript
import { convert } from '@hivellm/transmutation-lite';
import { ClassifyClient } from '@hivellm/classify';

// Convert document to Markdown
const conversionResult = await convert('./contract.pdf');

// Classify the markdown content
const classifier = new ClassifyClient({
  provider: 'deepseek',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const classificationResult = await classifier.classifyText(
  conversionResult.markdown
);

console.log('Domain:', classificationResult.classification.domain);
console.log('Type:', classificationResult.classification.doc_type);
```

## CLI Commands

### `convert <file>`

Convert a single file to Markdown.

**Options:**
- `-o, --output <path>` - Output file path (default: `<filename>.md`)
- `-m, --max-pages <number>` - Maximum pages/sheets to process
- `--no-preserve-formatting` - Disable formatting preservation

**Examples:**

```bash
# Basic conversion
transmutation-lite convert document.pdf

# Specify output
transmutation-lite convert document.pdf -o output/document.md

# Limit pages
transmutation-lite convert large.pdf --max-pages 10

# Disable formatting
transmutation-lite convert document.docx --no-preserve-formatting
```

### `batch <directory>`

Convert all supported files in a directory.

**Options:**
- `-o, --output <path>` - Output directory (default: `<directory>/output`)
- `-r, --recursive` - Process subdirectories recursively
- `-m, --max-pages <number>` - Maximum pages/sheets to process
- `--parallel <number>` - Number of parallel conversions (default: 4)
- `--no-preserve-formatting` - Disable formatting preservation

**Examples:**

```bash
# Basic batch conversion
transmutation-lite batch ./documents

# Recursive with custom output
transmutation-lite batch ./docs -o ./markdown --recursive

# High parallelism
transmutation-lite batch ./files --parallel 8

# Limit pages for all files
transmutation-lite batch ./pdfs --max-pages 5
```

### `formats`

List all supported file formats.

```bash
transmutation-lite formats
```

## Examples

### Convert PDF with Metadata

```typescript
import { Converter } from '@hivellm/transmutation-lite';

const converter = new Converter();
const result = await converter.convertFile('./research-paper.pdf');

console.log('Title:', result.metadata.title);
console.log('Author:', result.metadata.author);
console.log('Pages:', result.metadata.pageCount);
console.log('Created:', result.metadata.createdAt);
console.log('Producer:', result.metadata.extra?.producer);
```

### Batch Processing with Progress

```typescript
import { Converter } from '@hivellm/transmutation-lite';
import { readdir } from 'fs/promises';
import { join } from 'path';

const converter = new Converter();
const files = await readdir('./documents');

let completed = 0;
for (const file of files) {
  const filePath = join('./documents', file);
  
  if (converter.isSupported(filePath)) {
    try {
      const result = await converter.convertFile(filePath);
      await writeFile(
        `./output/${file}.md`,
        result.markdown
      );
      completed++;
      console.log(`✅ [${completed}/${files.length}] ${file}`);
    } catch (error) {
      console.error(`❌ Failed: ${file}`, error);
    }
  }
}
```

### Excel to Markdown Tables

```typescript
import { convert } from '@hivellm/transmutation-lite';

const result = await convert('./data.xlsx');

// Output will be Markdown tables:
// # Sheet1
//
// | Column A | Column B | Column C |
// | --- | --- | --- |
// | Value 1 | Value 2 | Value 3 |
// | Value 4 | Value 5 | Value 6 |

console.log(result.markdown);
```

### Error Handling

```typescript
import { convert, ConversionError } from '@hivellm/transmutation-lite';

try {
  const result = await convert('./document.pdf');
  console.log(result.markdown);
} catch (error) {
  if (error instanceof ConversionError) {
    console.error('Conversion failed:', error.message);
    console.error('Format:', error.format);
    console.error('Cause:', error.cause);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Performance

Typical conversion times on modern hardware:

| Format | File Size | Pages | Time | Notes |
|--------|-----------|-------|------|-------|
| PDF | 2 MB | 15 | ~200ms | Text extraction only |
| DOCX | 500 KB | 20 | ~150ms | Full formatting |
| XLSX | 1 MB | 10 sheets | ~100ms | Table conversion |
| PPTX | 3 MB | 30 slides | ~300ms | Basic text extraction |
| HTML | 200 KB | - | ~50ms | Fast conversion |

## Limitations

- **No OCR** - PDF images are not extracted or processed
- **No Audio/Video** - Audio and video files are not supported
- **No Archives** - ZIP, TAR, and other archives are not supported
- **PPTX Quality** - PowerPoint conversion is basic (text-only)
- **Images** - Image extraction is not implemented in this lite version
- **Lower Precision** - Text extraction quality is lower than the Rust version

### When to Use Transmutation Lite vs Full Transmutation

| Feature | Transmutation Lite (TypeScript) | Transmutation (Rust) |
|---------|--------------------------------|---------------------|
| **Best For** | Document classification, quick previews | RAG systems, production pipelines |
| **Precision** | ⚠️ Good (~60-70%) | ✅ Excellent (80%+) |
| **Performance** | Fast | ✅ **98x faster** than Docling |
| **Memory** | Low (~50MB) | ✅ Very Low (~20MB) |
| **OCR Support** | ❌ No | ✅ Yes (Tesseract) |
| **Audio/Video** | ❌ No | ✅ Yes (Whisper) |
| **Archives** | ❌ No | ✅ Yes (ZIP, TAR, etc.) |
| **Setup** | ✅ npm install | Requires Rust/binary |
| **Integration** | ✅ Easy (Node.js) | Moderate (CLI/FFI) |

**Recommendation**: For production use cases requiring high-quality document conversion, we **strongly recommend** using the full [Transmutation](https://github.com/hivellm/transmutation) Rust library. Transmutation Lite is ideal for:
- Quick document classification (like HiveLLM Classify)
- Prototyping and development
- Simple text extraction where precision is not critical
- Node.js-only environments without Rust toolchain

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Type Check

```bash
npm run type-check
```

## Project Structure

```
transmutation-lite/
├── src/
│   ├── converters/
│   │   ├── base.ts       # Base converter interface
│   │   ├── pdf.ts        # PDF converter
│   │   ├── docx.ts       # DOCX converter
│   │   ├── xlsx.ts       # XLSX converter
│   │   ├── pptx.ts       # PPTX converter
│   │   ├── html.ts       # HTML converter
│   │   ├── txt.ts        # TXT converter
│   │   └── index.ts      # Converter exports
│   ├── types.ts          # Type definitions
│   ├── index.ts          # Main library export
│   └── cli.ts            # CLI implementation
├── tests/                # Test files
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Related Projects

- **[Classify](../classify/)** - Intelligent document classification using LLMs (uses Transmutation Lite)
- **[Transmutation](https://github.com/hivellm/transmutation)** ⭐ - **Recommended**: Full-featured Rust document converter with 98x performance and 80%+ quality
- **[Vectorizer](../vectorizer/)** - Vector database and search engine (uses full Transmutation)
- **[Nexus](../nexus/)** - Graph database with vector search

## License

MIT

## Contributing

This project follows the HiveLLM ecosystem standards:

1. TypeScript 5.x with strict mode
2. Comprehensive tests (95%+ coverage)
3. Clear documentation
4. Semantic versioning
5. Conventional commits

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

---

**Contact**: HiveLLM Development Team


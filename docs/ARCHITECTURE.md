# Architecture

## Overview

Transmutation Lite is a TypeScript-based document conversion library designed for simplicity and ease of integration with Node.js projects, specifically the HiveLLM Classify project.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Transmutation Lite                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────────────────────────────┐      │
│  │   CLI    │───▶│       Converter Class            │      │
│  └──────────┘    └──────────────────────────────────┘      │
│                              │                               │
│                              ▼                               │
│                   ┌──────────────────┐                      │
│                   │ Format Detection │                      │
│                   └──────────────────┘                      │
│                              │                               │
│              ┌───────────────┴───────────────┐             │
│              ▼                               ▼              │
│    ┌──────────────────┐           ┌──────────────────┐    │
│    │ Buffer Converter │           │  File Converter  │    │
│    └──────────────────┘           └──────────────────┘    │
│              │                               │              │
│              └───────────────┬───────────────┘             │
│                              ▼                               │
│                   ┌──────────────────┐                      │
│                   │ Converter Router │                      │
│                   └──────────────────┘                      │
│                              │                               │
│        ┌─────────────────────┼─────────────────────┐       │
│        ▼          ▼          ▼          ▼          ▼        │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│   │  PDF   │ │  DOCX  │ │  XLSX  │ │  PPTX  │ │  HTML  │ │
│   │Convert │ │Convert │ │Convert │ │Convert │ │Convert │ │
│   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │
│        │          │          │          │          │        │
│        ▼          ▼          ▼          ▼          ▼        │
│   ┌───────────────────────────────────────────────────┐   │
│   │         External Libraries                         │   │
│   │  pdf-parse, mammoth, xlsx, jszip, turndown       │   │
│   └───────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│                   ┌──────────────────┐                      │
│                   │ Markdown Output  │                      │
│                   │   + Metadata     │                      │
│                   └──────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Converter Class

Main orchestrator that manages all format-specific converters.

**Responsibilities:**
- Format detection from file extensions
- Routing to appropriate converter
- Converter registration and management
- Unified API for all conversions

**Location:** `src/index.ts`

### 2. Base Converter

Abstract base class that defines the converter interface.

**Interface:**
```typescript
interface IConverter {
  convert(buffer: Buffer, options?: ConversionOptions): Promise<ConversionResult>;
  getFormat(): DocumentFormat;
  canHandle(extension: string): boolean;
}
```

**Location:** `src/converters/base.ts`

### 3. Format-Specific Converters

Each converter implements the `IConverter` interface:

- **PdfConverter** (`pdf.ts`) - Uses `pdf-parse` for text extraction
- **DocxConverter** (`docx.ts`) - Uses `mammoth` for Word documents
- **XlsxConverter** (`xlsx.ts`) - Uses `xlsx` for Excel spreadsheets
- **PptxConverter** (`pptx.ts`) - Uses `jszip` for basic PowerPoint text
- **HtmlConverter** (`html.ts`) - Uses `turndown` for HTML to Markdown
- **TxtConverter** (`txt.ts`) - Native text handling

**Location:** `src/converters/`

### 4. CLI

Command-line interface built with `commander`.

**Commands:**
- `convert <file>` - Convert single file
- `batch <directory>` - Batch convert multiple files
- `formats` - List supported formats

**Location:** `src/cli.ts`

## Data Flow

### Single File Conversion

```
1. User calls convert(filePath)
2. Converter detects format from extension
3. File is read into Buffer
4. Format-specific converter is selected
5. Buffer is passed to converter.convert()
6. External library processes the buffer
7. Result is formatted as ConversionResult
8. Metadata is extracted and attached
9. ConversionResult is returned
```

### Batch Conversion

```
1. User calls batch command
2. Directory is scanned for files
3. Files are filtered by supported formats
4. Files are grouped into batches (default: 4 parallel)
5. For each batch:
   a. Files are converted in parallel
   b. Results are collected
   c. Progress is logged
6. Summary statistics are displayed
```

## Type System

### Core Types

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

interface ConversionOptions {
  preserveFormatting?: boolean;
  extractImages?: boolean;
  maxPages?: number;
  formatOptions?: Record<string, any>;
}

interface ConversionResult {
  markdown: string;
  metadata: DocumentMetadata;
  conversionTimeMs: number;
  warnings?: string[];
}

interface DocumentMetadata {
  format: DocumentFormat;
  fileSize: number;
  pageCount?: number;
  title?: string;
  author?: string;
  createdAt?: Date;
  extra?: Record<string, any>;
}
```

**Location:** `src/types.ts`

## Dependencies

### Direct Dependencies

1. **pdf-parse** (^2.4.5) - PDF text extraction
2. **mammoth** (^1.11.0) - DOCX to Markdown conversion
3. **xlsx** (^0.18.5) - Excel file parsing
4. **jszip** (^3.10.1) - ZIP file handling for PPTX
5. **turndown** (^7.2.2) - HTML to Markdown conversion
6. **commander** (^14.0.2) - CLI framework

### Development Dependencies

- TypeScript 5.7.2
- tsup 8.3.5 (bundler)
- vitest 2.1.9 (testing)
- ESLint 9.19.0 (linting)

## Design Decisions

### Why TypeScript over Rust?

1. **Easy Integration** - Seamless Node.js integration for classify
2. **Rapid Development** - Faster prototyping for internal tools
3. **No Build Complexity** - No Rust toolchain required
4. **Trade-off** - Accepts lower performance for simpler deployment

### Why Not Full Transmutation?

Transmutation Lite is **not a replacement** for the full Rust version:

- **Different Use Case** - Classification vs. Production RAG
- **Different Requirements** - Speed/ease vs. Quality/performance
- **Complementary** - Works alongside, not instead of

### Converter Pattern

Each format converter is isolated:

- **Maintainability** - Easy to update individual converters
- **Testability** - Each converter can be tested independently
- **Extensibility** - New formats can be added without changes to core

## Performance Considerations

### Memory Management

- **Streaming Not Used** - Files are loaded entirely into memory
- **Limitation** - Large files (>100MB) may cause issues
- **Mitigation** - maxPages option to limit processing

### Parallelization

- **Batch Processing** - Configurable parallel execution
- **Default** - 4 concurrent conversions
- **Trade-off** - Memory usage vs. speed

### Caching

- **Not Implemented** - No built-in caching
- **Reason** - Designed for use with classify's caching layer
- **Future** - Could add optional caching for standalone use

## Error Handling

### ConversionError

Custom error class for conversion failures:

```typescript
class ConversionError extends Error {
  format?: DocumentFormat;
  cause?: Error;
}
```

### Error Propagation

1. Library errors are caught
2. Wrapped in ConversionError
3. Original error attached as `cause`
4. Format information included
5. Propagated to caller

## Future Improvements

### Potential Enhancements

1. **Streaming Support** - For large files
2. **Better PPTX** - Dedicated parser instead of jszip
3. **Format Detection** - Magic bytes instead of extension
4. **Caching Layer** - Optional built-in caching
5. **Progress Events** - Real-time progress reporting
6. **Plugin System** - Custom converters

### Known Limitations

1. **PPTX Quality** - Basic text extraction only
2. **PDF Precision** - Limited formatting preservation
3. **No OCR** - Images are not processed
4. **Memory Usage** - Entire files loaded into memory
5. **No Validation** - Minimal input validation

## Testing Strategy

### Current Coverage

- **Unit Tests** - Basic converter functionality
- **Integration Tests** - Format detection and routing
- **CLI Tests** - Command execution

### Test Files

- `src/index.test.ts` - 16 tests covering core functionality

### Future Testing

- Format-specific tests with sample files
- Performance benchmarks
- Memory usage tests
- Error handling scenarios
- Edge cases (corrupted files, empty files, etc.)


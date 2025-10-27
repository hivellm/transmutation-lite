# API Reference

## Table of Contents

- [Main Functions](#main-functions)
- [Classes](#classes)
- [Types](#types)
- [Enums](#enums)
- [Errors](#errors)

## Main Functions

### `convert(filePath, options?)`

Convenience function to convert a single file to Markdown.

**Signature:**
```typescript
function convert(
  filePath: string,
  options?: ConversionOptions
): Promise<ConversionResult>
```

**Parameters:**
- `filePath` (string) - Path to the file to convert
- `options` (ConversionOptions, optional) - Conversion options

**Returns:**
- `Promise<ConversionResult>` - Conversion result with markdown and metadata

**Throws:**
- `ConversionError` - If conversion fails or format is unsupported

**Example:**
```typescript
import { convert } from '@hivellm/transmutation-lite';

const result = await convert('./document.pdf', {
  preserveFormatting: true,
  maxPages: 10,
});

console.log(result.markdown);
console.log(result.metadata.pageCount);
```

---

### `convertBuffer(buffer, format, options?)`

Convenience function to convert a buffer directly.

**Signature:**
```typescript
function convertBuffer(
  buffer: Buffer,
  format: DocumentFormat,
  options?: ConversionOptions
): Promise<ConversionResult>
```

**Parameters:**
- `buffer` (Buffer) - File content as buffer
- `format` (DocumentFormat) - Document format
- `options` (ConversionOptions, optional) - Conversion options

**Returns:**
- `Promise<ConversionResult>` - Conversion result

**Example:**
```typescript
import { convertBuffer, DocumentFormat } from '@hivellm/transmutation-lite';
import { readFile } from 'fs/promises';

const buffer = await readFile('./document.pdf');
const result = await convertBuffer(buffer, DocumentFormat.PDF);
```

---

## Classes

### `Converter`

Main converter class that manages all format converters.

**Constructor:**
```typescript
constructor()
```

**Methods:**

#### `convertFile(filePath, options?)`

Convert a file to Markdown.

**Signature:**
```typescript
async convertFile(
  filePath: string,
  options?: ConversionOptions
): Promise<ConversionResult>
```

**Parameters:**
- `filePath` (string) - Path to file
- `options` (ConversionOptions, optional) - Conversion options

**Returns:**
- `Promise<ConversionResult>` - Conversion result

**Example:**
```typescript
const converter = new Converter();
const result = await converter.convertFile('./document.docx');
```

---

#### `convertBuffer(buffer, format, options?)`

Convert a buffer to Markdown.

**Signature:**
```typescript
async convertBuffer(
  buffer: Buffer,
  format: DocumentFormat,
  options?: ConversionOptions
): Promise<ConversionResult>
```

**Parameters:**
- `buffer` (Buffer) - File content
- `format` (DocumentFormat) - Document format
- `options` (ConversionOptions, optional) - Conversion options

**Returns:**
- `Promise<ConversionResult>` - Conversion result

---

#### `detectFormat(filePath)`

Detect document format from file extension.

**Signature:**
```typescript
detectFormat(filePath: string): DocumentFormat
```

**Parameters:**
- `filePath` (string) - Path to file

**Returns:**
- `DocumentFormat` - Detected format or `DocumentFormat.UNKNOWN`

**Example:**
```typescript
const converter = new Converter();
const format = converter.detectFormat('./document.pdf');
// Returns: DocumentFormat.PDF
```

---

#### `isSupported(filePath)`

Check if a file format is supported.

**Signature:**
```typescript
isSupported(filePath: string): boolean
```

**Parameters:**
- `filePath` (string) - Path to file

**Returns:**
- `boolean` - `true` if supported, `false` otherwise

**Example:**
```typescript
const converter = new Converter();
if (converter.isSupported('./document.pdf')) {
  // Convert the file
}
```

---

#### `getSupportedFormats()`

Get list of all supported formats.

**Signature:**
```typescript
getSupportedFormats(): DocumentFormat[]
```

**Returns:**
- `DocumentFormat[]` - Array of supported formats

**Example:**
```typescript
const converter = new Converter();
const formats = converter.getSupportedFormats();
// Returns: [DocumentFormat.PDF, DocumentFormat.DOCX, ...]
```

---

## Types

### `ConversionOptions`

Options for document conversion.

**Properties:**

```typescript
interface ConversionOptions {
  /**
   * Preserve original formatting where possible
   * @default true
   */
  preserveFormatting?: boolean;

  /**
   * Extract images (not implemented in lite version)
   * @default false
   */
  extractImages?: boolean;

  /**
   * Maximum pages/sheets to process (0 = all)
   * @default 0
   */
  maxPages?: number;

  /**
   * Custom format-specific options
   */
  formatOptions?: Record<string, any>;
}
```

**Example:**
```typescript
const options: ConversionOptions = {
  preserveFormatting: true,
  maxPages: 10,
};
```

---

### `ConversionResult`

Result of a document conversion.

**Properties:**

```typescript
interface ConversionResult {
  /**
   * Converted markdown content
   */
  markdown: string;

  /**
   * Document metadata
   */
  metadata: DocumentMetadata;

  /**
   * Conversion time in milliseconds
   */
  conversionTimeMs: number;

  /**
   * Warnings during conversion (if any)
   */
  warnings?: string[];
}
```

**Example:**
```typescript
const result: ConversionResult = await convert('./document.pdf');
console.log(result.markdown);
console.log(`Converted in ${result.conversionTimeMs}ms`);
```

---

### `DocumentMetadata`

Metadata extracted from the document.

**Properties:**

```typescript
interface DocumentMetadata {
  /**
   * Original document format
   */
  format: DocumentFormat;

  /**
   * File size in bytes
   */
  fileSize: number;

  /**
   * Number of pages/sheets/slides (if available)
   */
  pageCount?: number;

  /**
   * Document title (if available)
   */
  title?: string;

  /**
   * Document author (if available)
   */
  author?: string;

  /**
   * Creation date (if available)
   */
  createdAt?: Date;

  /**
   * Format-specific extra metadata
   */
  extra?: Record<string, any>;
}
```

**Example:**
```typescript
const { metadata } = await convert('./document.pdf');
console.log(`Title: ${metadata.title}`);
console.log(`Pages: ${metadata.pageCount}`);
console.log(`Author: ${metadata.author}`);
```

---

## Enums

### `DocumentFormat`

Supported document formats.

**Values:**

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

**Example:**
```typescript
import { DocumentFormat } from '@hivellm/transmutation-lite';

const format = DocumentFormat.PDF;
```

---

## Errors

### `ConversionError`

Custom error class for conversion failures.

**Properties:**

```typescript
class ConversionError extends Error {
  /**
   * Document format that failed to convert
   */
  format?: DocumentFormat;

  /**
   * Original error that caused the failure
   */
  cause?: Error;
}
```

**Example:**
```typescript
import { convert, ConversionError } from '@hivellm/transmutation-lite';

try {
  await convert('./document.pdf');
} catch (error) {
  if (error instanceof ConversionError) {
    console.error(`Failed to convert ${error.format}`);
    console.error(`Reason: ${error.message}`);
    console.error(`Original error:`, error.cause);
  }
}
```

---

## Format-Specific Notes

### PDF

- Uses `pdf-parse` library
- Text extraction only, no images
- Limited formatting preservation
- Metadata: title, author, creation date, producer

### DOCX

- Uses `mammoth` library
- Good formatting support
- Converts headings, lists, tables
- Metadata: limited

### XLSX

- Uses `xlsx` library
- Converts sheets to Markdown tables
- Each sheet becomes a separate section
- Metadata: sheet names, sheet count

### PPTX

- Uses `jszip` for basic extraction
- ⚠️ Limited quality - text only
- No formatting preservation
- Experimental implementation

### HTML

- Uses `turndown` library
- Good Markdown conversion
- Preserves links, headings, lists
- Metadata: page title

### TXT

- Native handling
- Direct pass-through with cleanup
- Normalizes line endings
- No metadata extraction

---

## Complete Examples

### Basic Usage

```typescript
import { convert } from '@hivellm/transmutation-lite';

// Simple conversion
const result = await convert('./document.pdf');
console.log(result.markdown);
```

### Advanced Usage

```typescript
import { Converter, DocumentFormat } from '@hivellm/transmutation-lite';

const converter = new Converter();

// Check if supported
if (!converter.isSupported('./document.xyz')) {
  console.error('Unsupported format');
  process.exit(1);
}

// Convert with options
const result = await converter.convertFile('./document.pdf', {
  preserveFormatting: true,
  maxPages: 5,
});

// Display results
console.log('Markdown:', result.markdown);
console.log('Format:', result.metadata.format);
console.log('Pages:', result.metadata.pageCount);
console.log('Time:', result.conversionTimeMs, 'ms');

// Check for warnings
if (result.warnings && result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```

### Batch Processing

```typescript
import { Converter } from '@hivellm/transmutation-lite';
import { readdir } from 'fs/promises';
import { join } from 'path';

const converter = new Converter();
const files = await readdir('./documents');

for (const file of files) {
  const filePath = join('./documents', file);
  
  if (converter.isSupported(filePath)) {
    try {
      const result = await converter.convertFile(filePath);
      console.log(`✅ ${file} - ${result.metadata.pageCount} pages`);
    } catch (error) {
      console.error(`❌ ${file}:`, error);
    }
  }
}
```

### Buffer Conversion

```typescript
import { convertBuffer, DocumentFormat } from '@hivellm/transmutation-lite';
import { readFile } from 'fs/promises';

const buffer = await readFile('./document.pdf');
const result = await convertBuffer(buffer, DocumentFormat.PDF, {
  maxPages: 10,
});

console.log(result.markdown);
```


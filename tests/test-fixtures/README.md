# Test Fixtures

This directory contains sample documents for testing the transmutation-lite converters.

## Directory Structure

- `pdf/` - PDF test files
- `docx/` - Microsoft Word test files
- `xlsx/` - Excel spreadsheet test files
- `pptx/` - PowerPoint presentation test files
- `html/` - HTML test files
- `txt/` - Plain text test files

## File Naming Convention

- `simple.*` - Basic test case with minimal complexity
- `complex.*` - Advanced test case with multiple features
- `with-metadata.*` - File containing metadata to extract
- `multi-*.*` - File with multiple pages/sheets/slides
- `empty.*` - Empty or minimal content file
- `corrupted.*` - Invalid or corrupted file for error testing

## Creating Test Files

### PDF Files
For PDF files, you can create them using:
- Online converters (e.g., HTML to PDF)
- LibreOffice/Microsoft Office "Print to PDF"
- PDF libraries in Node.js/Python

### DOCX Files
Use Microsoft Word or LibreOffice Writer to create .docx files with:
- Various heading levels (H1-H6)
- Lists (ordered and unordered)
- Tables
- Bold, italic, underline formatting
- Images (for future image extraction tests)

### XLSX Files
Use Excel or LibreOffice Calc to create spreadsheets with:
- Multiple sheets
- Formulas
- Empty sheets
- Various data types

### PPTX Files
Use PowerPoint or LibreOffice Impress to create presentations with:
- Text slides
- Speaker notes
- Multiple slide layouts
- Images (for future tests)

## Usage in Tests

Tests should import fixtures using relative paths:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const fixturePath = join(__dirname, '../test-fixtures/txt/simple.txt');
const buffer = readFileSync(fixturePath);
```

## Note

Binary files (PDF, DOCX, XLSX, PPTX) need to be created separately and committed to the repository.
This README provides guidance on creating them.


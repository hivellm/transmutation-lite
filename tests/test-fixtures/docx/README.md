# DOCX Test Fixtures

To enable DOCX converter tests, create the following files manually using Microsoft Word or LibreOffice:

## Required Files

### simple.docx
Content:
```
Hello World
This is a simple DOCX document
```

### formatted.docx
Content with formatting:
- **Bold heading**: "Heading 1"
- Bold text: "This is bold text"
- Italic text: "This is italic text"

### empty.docx
An empty Word document

## How to Create

1. Use Microsoft Word Online (free at office.com)
2. Use LibreOffice Writer (free download)
3. Use Microsoft Word desktop

## Running Tests

Once files are created, tests will automatically run. Otherwise, they will be skipped.

```bash
npm test -- tests/converters/docx.test.ts
```


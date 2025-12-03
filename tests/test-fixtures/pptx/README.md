# PPTX Test Fixtures

To enable PPTX converter tests, create the following files manually using Microsoft PowerPoint or LibreOffice:

## Required Files

### simple.pptx
A single slide with:
- Title: "Slide 1"
- Content: "Welcome to the Presentation"

### multi-slide.pptx
A presentation with 3 slides:
- Slide 1: "Slide 1"
- Slide 2: "Slide 2"
- Slide 3: "Slide 3"

### empty.pptx
An empty PowerPoint presentation

## How to Create

1. Use Microsoft PowerPoint Online (free at office.com)
2. Use LibreOffice Impress (free download)
3. Use Microsoft PowerPoint desktop

## Running Tests

Once files are created, tests will automatically run. Otherwise, they will be skipped.

```bash
npm test -- tests/converters/pptx.test.ts
```


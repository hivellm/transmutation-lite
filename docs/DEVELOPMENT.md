# Development Guide

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- Git

### Setup

```bash
# Clone repository (if working separately)
git clone https://github.com/hivellm/transmutation-lite.git
cd transmutation-lite

# Install dependencies
npm install

# Build the project
npm run build
```

## Project Structure

```
transmutation-lite/
├── src/
│   ├── converters/       # Format-specific converters
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
│   ├── index.test.ts     # Main tests
│   └── cli.ts            # CLI implementation
├── dist/                 # Compiled output (generated)
├── docs/                 # Documentation
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── README.md
```

## Development Workflow

### 1. Make Changes

Edit files in `src/` directory.

### 2. Type Check

```bash
npm run type-check
```

Ensures TypeScript compilation without errors.

### 3. Lint

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### 4. Format

```bash
npm run format
```

Uses Prettier to format code.

### 5. Test

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 6. Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/` directory.

## Adding a New Converter

### Step 1: Create Converter File

Create new file: `src/converters/your-format.ts`

```typescript
import { BaseConverter } from './base.js';
import {
  DocumentFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from '../types.js';

export class YourFormatConverter extends BaseConverter {
  getFormat(): DocumentFormat {
    return DocumentFormat.YOUR_FORMAT; // Add to enum first
  }

  canHandle(extension: string): boolean {
    return extension.toLowerCase() === 'your-ext';
  }

  async convert(
    buffer: Buffer,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Your conversion logic here
      const markdown = await convertToMarkdown(buffer);

      const metadata = this.createMetadata(
        DocumentFormat.YOUR_FORMAT,
        buffer.length
      );

      return this.createResult(markdown, metadata, startTime, warnings);
    } catch (error) {
      throw new ConversionError(
        `Failed to convert YOUR_FORMAT: ${error instanceof Error ? error.message : 'Unknown error'}`,
        DocumentFormat.YOUR_FORMAT,
        error instanceof Error ? error : undefined
      );
    }
  }
}
```

### Step 2: Add to DocumentFormat Enum

Edit `src/types.ts`:

```typescript
export enum DocumentFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  // ... existing formats
  YOUR_FORMAT = 'your-format', // Add here
  UNKNOWN = 'unknown',
}
```

### Step 3: Register Converter

Edit `src/index.ts`:

```typescript
import { YourFormatConverter } from './converters/your-format.js';

export class Converter {
  constructor() {
    // ... existing converters
    this.registerConverter(new YourFormatConverter());
  }
}
```

### Step 4: Export Converter

Edit `src/converters/index.ts`:

```typescript
export { YourFormatConverter } from './your-format.js';
```

### Step 5: Add Tests

Edit `src/index.test.ts`:

```typescript
it('should detect YOUR_FORMAT format', () => {
  expect(converter.detectFormat('document.your-ext')).toBe(
    DocumentFormat.YOUR_FORMAT
  );
});
```

## Testing

### Running Tests

```bash
# Run once
npm test

# Watch mode (during development)
npm run test:watch

# With coverage report
npm run test:coverage
```

### Writing Tests

Tests use Vitest. Example:

```typescript
import { describe, it, expect } from 'vitest';
import { Converter, DocumentFormat } from './index.js';

describe('YourFormatConverter', () => {
  const converter = new Converter();

  it('should convert YOUR_FORMAT buffer', async () => {
    const buffer = Buffer.from('test content');
    const result = await converter.convertBuffer(
      buffer,
      DocumentFormat.YOUR_FORMAT
    );

    expect(result.markdown).toBeDefined();
    expect(result.metadata.format).toBe(DocumentFormat.YOUR_FORMAT);
  });
});
```

## Code Style

### TypeScript Guidelines

1. **Use strict mode** - Already configured
2. **Avoid `any`** - Use proper types or `unknown`
3. **Prefer interfaces** - For object types
4. **Use enums** - For fixed sets of values
5. **Document public APIs** - Use JSDoc comments

### Naming Conventions

- **Files** - kebab-case: `pdf-converter.ts`
- **Classes** - PascalCase: `PdfConverter`
- **Interfaces** - PascalCase with `I` prefix: `IConverter`
- **Functions** - camelCase: `convertToMarkdown`
- **Constants** - UPPER_SNAKE_CASE: `MAX_FILE_SIZE`

### Code Examples

**Good:**

```typescript
/**
 * Converts a PDF buffer to Markdown
 * @param buffer - PDF file buffer
 * @param options - Conversion options
 * @returns Conversion result with markdown and metadata
 */
export async function convertPdf(
  buffer: Buffer,
  options?: ConversionOptions
): Promise<ConversionResult> {
  // Implementation
}
```

**Avoid:**

```typescript
// Bad: No documentation, uses any
export async function convert(data: any): Promise<any> {
  // Implementation
}
```

## Debugging

### VSCode Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:watch"],
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI",
      "program": "${workspaceFolder}/dist/cli.js",
      "args": ["convert", "test.pdf"],
      "preLaunchTask": "npm: build"
    }
  ]
}
```

### Debug Tips

1. **Use console.log** - Simple and effective
2. **Use debugger statement** - Set breakpoints in code
3. **Check warnings** - ConversionResult includes warnings array
4. **Inspect errors** - ConversionError includes cause

## Common Issues

### Issue: Type errors after adding dependency

**Solution:** Install type definitions:

```bash
npm install --save-dev @types/your-library
```

### Issue: Tests failing after changes

**Solution:** Check:

1. Run `npm run build` first
2. Check for TypeScript errors: `npm run type-check`
3. Verify imports use `.js` extension
4. Ensure all async functions are awaited

### Issue: CLI not working

**Solution:**

```bash
# Rebuild
npm run build

# Test directly
node dist/cli.js convert test.pdf

# Check permissions
chmod +x dist/cli.js
```

## Performance Optimization

### Tips

1. **Avoid repeated conversions** - Cache results if needed
2. **Use maxPages** - Limit processing for large files
3. **Parallelize batch** - Adjust `--parallel` flag
4. **Profile with Node.js**:

```bash
node --inspect dist/cli.js convert large.pdf
```

Then open `chrome://inspect` in Chrome.

## Release Process

### Version Bump

```bash
# Patch (0.1.0 -> 0.1.1)
npm version patch

# Minor (0.1.0 -> 0.2.0)
npm version minor

# Major (0.1.0 -> 1.0.0)
npm version major
```

### Checklist Before Release

- [ ] All tests passing
- [ ] Linting clean
- [ ] Type check passing
- [ ] Build successful
- [ ] CHANGELOG.md updated
- [ ] README.md accurate
- [ ] Version bumped

### Publish to npm

```bash
# Build
npm run build

# Test package locally
npm pack

# Publish (when ready)
npm publish --access public
```

## Contributing

See main [README.md](../README.md) for contribution guidelines.

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Run quality checks
6. Submit PR with clear description

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [HiveLLM Ecosystem](https://github.com/hivellm)


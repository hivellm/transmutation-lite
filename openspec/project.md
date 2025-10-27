# Transmutation Lite - OpenSpec Project

## Project Overview

**Name:** Transmutation Lite  
**Type:** TypeScript Library + CLI  
**Status:** 🚧 In Development  
**Version:** 0.1.0

## Purpose

Create a lightweight, TypeScript-based document conversion library for common formats (PDF, DOCX, XLSX, PPTX, HTML, TXT) to Markdown, optimized for document classification use cases without requiring high precision.

## Goals

1. **Simplicity** - Easy npm install and integration with Node.js projects
2. **Classification Ready** - Optimized for HiveLLM Classify integration
3. **Basic Conversion** - Good-enough quality for non-critical use cases
4. **TypeScript Native** - Full type safety and IntelliSense support
5. **Clear Limitations** - Honest about what it can and cannot do

## Non-Goals

1. **Production RAG** - Use full Transmutation (Rust) for this
2. **High Precision** - Not competing with Docling/Transmutation quality
3. **OCR/Audio/Video** - Out of scope for lite version
4. **Archive Processing** - Not needed for classification

## Tech Stack

- **Language:** TypeScript 5.7+
- **Runtime:** Node.js 18+
- **Build:** tsup
- **Test:** vitest
- **Lint:** ESLint 9
- **Format:** Prettier

## Key Dependencies

- pdf-parse ^2.4.5
- mammoth ^1.11.0
- xlsx ^0.18.5
- jszip ^3.10.1
- turndown ^7.2.2
- commander ^14.0.2

## Architecture

\CLI → Converter → Format Detection → Converter Router → Format Converters → External Libraries → Markdown Output
\
## Target Use Cases

1. **Document Classification** - Primary use case with Classify
2. **Quick Previews** - Fast document content preview
3. **Prototyping** - Development and testing
4. **Simple Extraction** - When precision is not critical

## Success Metrics

- ✅ All 6 formats working (PDF, DOCX, XLSX, PPTX, HTML, TXT)
- ✅ 95%+ test coverage on core functionality
- ✅ TypeScript strict mode with no errors
- ✅ CLI with convert, batch, formats commands
- ✅ Complete documentation (API, Architecture, Development)
- ✅ Integration examples with Classify
- ⏳ Published to npm registry
- ⏳ Real-world testing with sample documents

# Initial Implementation of Transmutation Lite

## Why

HiveLLM Classify requires document conversion capability for classification tasks. The full Transmutation (Rust) library is optimized for production RAG systems with high precision requirements. A simpler TypeScript alternative is needed for classification use cases where speed of integration and "good enough" quality are more important than maximum precision.

## What Changes

- Create TypeScript library for document conversion to Markdown
- Support 6 common formats: PDF, DOCX, XLSX, PPTX, HTML, TXT
- Provide both library API and CLI interface
- Implement batch processing with parallel execution
- Add comprehensive documentation and examples
- Integrate with HiveLLM Classify project

## Impact

- **Affected specs:** 
  - document-conversion (new capability)
  - cli-interface (new capability)
- **Affected code:**
  - New package: transmutation-lite/
  - Integration: classify/package.json, classify/examples/
- **Breaking changes:** None (new package)


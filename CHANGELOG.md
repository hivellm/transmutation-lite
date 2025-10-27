# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-10-27

### Added

- **Comprehensive Test Suite**: 70 tests with 100% passing rate
  - 42 unit tests for converters (HTML: 17, TXT: 13, PDF: 12)
  - 16 core converter tests
  - 9 integration tests
  - 3 CLI tests
- **Real-World Testing**: PDF tests using actual arXiv papers
- **Comprehensive Examples**: 5 detailed usage examples
  - Basic usage with simple conversions
  - Format detection and auto-conversion
  - Batch processing with parallel execution
  - Advanced options showcase
  - Error handling best practices
- **GitHub Actions Workflows**: Complete CI/CD automation
  - `test.yml`: Multi-OS (Ubuntu, Windows, macOS) and multi-Node (18, 20, 22) testing
  - `lint.yml`: ESLint, TypeScript type-check, Prettier validation
  - `build.yml`: Build verification and artifact upload
  - `release.yml`: Automated npm publishing with provenance
- **Test Infrastructure**:
  - Test fixtures for HTML and TXT formats
  - Integration tests for batch conversion and error handling
  - CLI tests for command-line options
- **Package Configuration**:
  - `.npmignore` to exclude unnecessary files from package
  - Improved `.gitignore` with coverage and temp files
- **Quality Improvements**:
  - HTML converter with body content extraction
  - Script and style tag removal from HTML
  - Better error handling in converters

### Changed

- **Test Organization**: Moved all tests from `src/` to `/tests` directory
- **Test Environment**: Updated Vitest to use `happy-dom` for better compatibility
- **Project Structure**: Reorganized for better maintainability

### Fixed

- HTML conversion compatibility with happy-dom environment
- Conversion time tracking (now allows 0ms for very fast conversions)
- List bullet markers in HTML conversion (uses `-` instead of `*`)
- PDF parsing using `pdf-parse-new` with CommonJS module support

## [0.1.0] - 2025-10-27

### Added

- Initial release of Transmutation Lite
- PDF to Markdown conversion using `pdf-parse`
- DOCX to Markdown conversion using `mammoth`
- XLSX to Markdown conversion using `xlsx` library
- PPTX to Markdown conversion (basic text extraction)
- HTML to Markdown conversion using `turndown`
- TXT to Markdown conversion (normalization)
- CLI with `convert`, `batch`, and `formats` commands
- TypeScript library with full type definitions
- Batch processing with parallel execution
- Comprehensive documentation and examples
- Integration guide for HiveLLM Classify

### Features

- Auto-detection of file formats
- Metadata extraction (title, author, page count, etc.)
- Conversion time tracking
- Warning system for partial conversions
- Configurable options (preserveFormatting, maxPages)
- Support for 6 document formats (PDF, DOCX, XLSX, PPTX, HTML, TXT)

### Dependencies

- commander ^14.0.2
- jszip ^3.10.1
- mammoth ^1.11.0
- pdf-parse ^2.4.5
- turndown ^7.2.2
- xlsx ^0.18.5

### Documentation

- Complete README with API reference
- CLI usage examples
- Integration examples with Classify
- Type documentation
- Performance benchmarks

---

**Version:** 0.1.0  
**Status:** Production Ready


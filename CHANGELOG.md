# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive test suite with 58 tests (100% passing)
- GitHub Actions workflows (test, lint, build, release)
- Test fixtures for HTML and TXT formats
- Integration tests for batch conversion and error handling
- CLI tests for command-line interface
- Improved HTML converter with body content extraction
- Script/style tag removal from HTML

### Changed

- Reorganized test structure to `/tests` directory
- Updated Vitest configuration for happy-dom environment
- Enhanced error handling in converters

### Fixed

- HTML conversion in happy-dom environment
- Conversion time tracking (allowing 0ms for very fast conversions)

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


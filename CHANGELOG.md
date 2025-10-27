# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-10-27

### 🎉 Production Release

This is the first stable production release of Transmutation Lite!

**Complete Feature Set**:
- ✅ 6 document formats (PDF, DOCX, XLSX, PPTX, HTML, TXT)
- ✅ Result caching with LRU strategy
- ✅ Comprehensive logging system
- ✅ Input validation and security
- ✅ Metrics and monitoring
- ✅ 148 tests (100% passing)
- ✅ CI/CD workflows
- ✅ Complete documentation

### Summary of All Phases

- **Phase 1**: Comprehensive testing (70 tests)
- **Phase 2**: Performance & optimization (caching, benchmarks)
- **Phase 3**: Converter improvements (PDF with arXiv testing)
- **Phase 4**: Developer experience (logging, validation)
- **Phase 5**: Documentation & examples (5 comprehensive examples)
- **Phase 6**: CI/CD automation (GitHub Actions)
- **Phase 7**: npm publication ready
- **Phase 8**: Skipped (standalone library design)
- **Phase 10**: Production hardening (metrics, monitoring)

**Final Stats**:
- 148 tests passing (100%)
- 87.5% phase completion (7 of 8 applicable phases)
- Production-ready with enterprise features
- Full TypeScript support
- Comprehensive documentation

## [0.5.0] - 2025-10-27

### Added

- **Developer Experience Improvements** (Phase 4):
  - Comprehensive logging system with levels (DEBUG, INFO, WARN, ERROR, NONE)
  - Input validation for buffers, formats, file paths, and options
  - Enhanced error messages with context and suggestions
  - Logger class with timestamps, prefixes, and child loggers
  - Cache configuration validation
  - Better file system error handling (ENOENT, EACCES)
- **37 new tests**: Complete coverage for logging and validation
- **Environment Variables**: `TRANSMUTATION_LOG_LEVEL` and `TRANSMUTATION_LOG_TIMESTAMPS`

### Changed

- `Converter` now validates all inputs by default (can be disabled)
- Error messages now list supported formats and provide better guidance
- File path validation prevents dangerous patterns
- Total test count increased to 131 tests (100% passing)

### Security

- Added validation against path traversal attacks
- Added protection against system directory access
- Buffer size limits (500MB max) to prevent memory issues

## [0.4.0] - 2025-10-27

### Added

- **Performance Optimizations** (Phase 2):
  - Result caching with LRU strategy and SHA-256 content hashing
  - Configurable cache size and TTL (time-to-live)
  - Cache statistics API (size, hits, memory usage)
  - Performance benchmark suite with detailed metrics
  - Benchmark comparison tool for tracking changes
- **24 Cache Tests**: Complete test coverage for caching functionality
- **Benchmark Tools**:
  - `BenchmarkRunner` for automated performance testing
  - Comparison tool for baseline vs current performance
  - Metrics: throughput (MB/s), timing, memory usage

### Changed

- `Converter` now accepts configuration options (`enableCache`, `cacheSize`, `cacheMaxAge`)
- Total test count increased to 94 tests (100% passing)
- Performance improvements with cache hit rates

### Documentation

- Added benchmarking README with usage examples
- Cache API documentation
- Performance optimization guide

## [0.3.0] - 2025-10-27

### Added

- **PDF Converter Tests**: 12 comprehensive tests with real arXiv papers
- **Usage Examples**: 5 detailed examples covering all major use cases
- **Examples Documentation**: README with patterns and best practices

### Changed

- Migrated from `pdf-parse` to `pdf-parse-new` for better ESM compatibility
- Updated overall test count to 70 tests (100% passing)
- Improved PDF converter with proper CommonJS module handling

### Documentation

- Updated STATUS.md: now at 60% completion (5 of 10 phases complete)
- Enhanced CHANGELOG with detailed changes
- Added comprehensive examples for library usage

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


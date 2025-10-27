# CLI Interface Capability

## ADDED Requirements

### Requirement: Convert Command
The system SHALL provide a CLI command to convert individual files.

#### Scenario: Convert single file
- **WHEN** user runs `transmutation-lite convert <file>`
- **THEN** the system converts the file to Markdown
- **AND** saves output to default location (same name with .md extension)
- **AND** displays conversion statistics

#### Scenario: Convert with custom output
- **WHEN** user provides --output flag
- **THEN** the system saves to the specified path
- **AND** creates output directory if needed

#### Scenario: Convert with page limit
- **WHEN** user provides --max-pages option
- **THEN** the system limits processing to specified pages
- **AND** reports truncation in output

#### Scenario: Convert with formatting disabled
- **WHEN** user provides --no-preserve-formatting
- **THEN** the system disables formatting preservation

---

### Requirement: Batch Command
The system SHALL provide batch conversion for multiple files.

#### Scenario: Batch convert directory
- **WHEN** user runs `transmutation-lite batch <directory>`
- **THEN** the system finds all supported files
- **AND** converts them in parallel (default 4)
- **AND** saves to output directory

#### Scenario: Recursive batch processing
- **WHEN** user provides --recursive flag
- **THEN** the system processes subdirectories
- **AND** maintains directory structure in output

#### Scenario: Parallel batch conversion
- **WHEN** user provides --parallel option
- **THEN** the system converts specified number in parallel
- **AND** reports progress for each file

#### Scenario: Batch with no supported files
- **WHEN** directory contains no supported files
- **THEN** the system reports no files found
- **AND** exits with error code

#### Scenario: Batch conversion summary
- **WHEN** batch processing completes
- **THEN** the system displays summary statistics
- **AND** reports success and failure counts

---

### Requirement: Formats Command
The system SHALL list all supported file formats.

#### Scenario: List formats
- **WHEN** user runs `transmutation-lite formats`
- **THEN** the system lists all supported formats
- **AND** displays them in a readable format

---

### Requirement: Error Reporting
The system SHALL provide clear error messages in CLI.

#### Scenario: Report unsupported format
- **WHEN** user tries to convert unsupported format
- **THEN** the system displays error message
- **AND** exits with non-zero code

#### Scenario: Report conversion failure
- **WHEN** file conversion fails
- **THEN** the system displays error with file name
- **AND** includes error details
- **AND** exits with non-zero code

---

### Requirement: Progress Feedback
The system SHALL provide progress feedback during conversions.

#### Scenario: Show single file progress
- **WHEN** converting a file
- **THEN** the system displays file name
- **AND** shows conversion time
- **AND** reports any warnings

#### Scenario: Show batch progress
- **WHEN** batch converting files
- **THEN** the system shows current/total count
- **AND** displays each file as it completes
- **AND** shows success or failure status

---

### Requirement: CLI Help
The system SHALL provide help documentation via CLI.

#### Scenario: Display command help
- **WHEN** user runs command with --help
- **THEN** the system displays command usage
- **AND** lists all available options
- **AND** shows examples


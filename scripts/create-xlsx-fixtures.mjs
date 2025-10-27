import XLSX from 'xlsx';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const fixturesDir = 'tests/test-fixtures/xlsx';

// Criar diretório
mkdirSync(fixturesDir, { recursive: true });

console.log('Creating XLSX fixtures...');

// Simple XLSX
const wb1 = XLSX.utils.book_new();
const ws1 = XLSX.utils.aoa_to_sheet([
  ['Name', 'Age'],
  ['Alice', 25],
  ['Bob', 30]
]);
XLSX.utils.book_append_sheet(wb1, ws1, 'Sheet1');
XLSX.writeFile(wb1, join(fixturesDir, 'simple.xlsx'));
console.log('✓ simple.xlsx');

// Multi-sheet XLSX
const wb2 = XLSX.utils.book_new();
const ws2a = XLSX.utils.aoa_to_sheet([['Data 1', 'Value 1'], ['A', 1], ['B', 2]]);
const ws2b = XLSX.utils.aoa_to_sheet([['Data 2', 'Value 2'], ['C', 3], ['D', 4]]);
XLSX.utils.book_append_sheet(wb2, ws2a, 'Sheet1');
XLSX.utils.book_append_sheet(wb2, ws2b, 'Sheet2');
XLSX.writeFile(wb2, join(fixturesDir, 'multi-sheet.xlsx'));
console.log('✓ multi-sheet.xlsx');

// Empty XLSX
const wb3 = XLSX.utils.book_new();
const ws3 = XLSX.utils.aoa_to_sheet([[]]);
XLSX.utils.book_append_sheet(wb3, ws3, 'Sheet1');
XLSX.writeFile(wb3, join(fixturesDir, 'empty.xlsx'));
console.log('✓ empty.xlsx');

console.log('\n✅ All XLSX fixtures created successfully!');
console.log('\nNote: DOCX and PPTX fixtures need to be created manually.');
console.log('Those tests will be skipped until fixtures are provided.');


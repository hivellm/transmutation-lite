import { writeFileSync } from 'fs';
import { join } from 'path';
import officegen from 'officegen';
import XLSX from 'xlsx';

const fixturesDir = 'tests/test-fixtures';

// Create XLSX fixtures
console.log('Creating XLSX fixtures...');

// Simple XLSX
const wb1 = XLSX.utils.book_new();
const ws1 = XLSX.utils.aoa_to_sheet([
  ['Name', 'Age'],
  ['Alice', 25],
  ['Bob', 30]
]);
XLSX.utils.book_append_sheet(wb1, ws1, 'Sheet1');
XLSX.writeFile(wb1, join(fixturesDir, 'xlsx/simple.xlsx'));

// Multi-sheet XLSX
const wb2 = XLSX.utils.book_new();
const ws2a = XLSX.utils.aoa_to_sheet([['Data 1', 'Value 1'], ['A', 1], ['B', 2]]);
const ws2b = XLSX.utils.aoa_to_sheet([['Data 2', 'Value 2'], ['C', 3], ['D', 4]]);
XLSX.utils.book_append_sheet(wb2, ws2a, 'Sheet1');
XLSX.utils.book_append_sheet(wb2, ws2b, 'Sheet2');
XLSX.writeFile(wb2, join(fixturesDir, 'xlsx/multi-sheet.xlsx'));

// Empty XLSX
const wb3 = XLSX.utils.book_new();
const ws3 = XLSX.utils.aoa_to_sheet([[]]);
XLSX.utils.book_append_sheet(wb3, ws3, 'Sheet1');
XLSX.writeFile(wb3, join(fixturesDir, 'xlsx/empty.xlsx'));

console.log('✓ XLSX fixtures created');

// Create DOCX fixtures using officegen
console.log('Creating DOCX fixtures...');

// Simple DOCX
const docx1 = officegen('docx');
const p1 = docx1.createP();
p1.addText('Hello World', { bold: true, font_size: 16 });
const p2 = docx1.createP();
p2.addText('This is a simple DOCX document');

const out1 = writeFileSync(join(fixturesDir, 'docx/simple.docx'), '');
docx1.generate(join(fixturesDir, 'docx/simple.docx'));

setTimeout(() => {
  // Formatted DOCX
  const docx2 = officegen('docx');
  const p3 = docx2.createP();
  p3.addText('Heading 1', { bold: true, font_size: 18 });
  const p4 = docx2.createP();
  p4.addText('This is bold text', { bold: true });
  const p5 = docx2.createP();
  p5.addText('This is italic text', { italic: true });
  
  docx2.generate(join(fixturesDir, 'docx/formatted.docx'));
  
  setTimeout(() => {
    // Empty DOCX
    const docx3 = officegen('docx');
    docx3.generate(join(fixturesDir, 'docx/empty.docx'));
    
    console.log('✓ DOCX fixtures created');
    
    // Create PPTX fixtures
    setTimeout(() => {
      console.log('Creating PPTX fixtures...');
      
      // Simple PPTX
      const pptx1 = officegen('pptx');
      pptx1.setDocTitle('Simple Presentation');
      const slide1 = pptx1.makeNewSlide();
      slide1.addText('Slide 1', { x: 1, y: 1, font_size: 32, bold: true });
      slide1.addText('Welcome to the Presentation', { x: 1, y: 2, font_size: 18 });
      
      pptx1.generate(join(fixturesDir, 'pptx/simple.pptx'));
      
      setTimeout(() => {
        // Multi-slide PPTX
        const pptx2 = officegen('pptx');
        const slide2a = pptx2.makeNewSlide();
        slide2a.addText('Slide 1', { x: 1, y: 1, font_size: 32 });
        const slide2b = pptx2.makeNewSlide();
        slide2b.addText('Slide 2', { x: 1, y: 1, font_size: 32 });
        const slide2c = pptx2.makeNewSlide();
        slide2c.addText('Slide 3', { x: 1, y: 1, font_size: 32 });
        
        pptx2.generate(join(fixturesDir, 'pptx/multi-slide.pptx'));
        
        setTimeout(() => {
          // Empty PPTX
          const pptx3 = officegen('pptx');
          pptx3.generate(join(fixturesDir, 'pptx/empty.pptx'));
          
          console.log('✓ PPTX fixtures created');
          console.log('\n✅ All Office fixtures created successfully!');
        }, 500);
      }, 500);
    }, 500);
  }, 500);
}, 500);


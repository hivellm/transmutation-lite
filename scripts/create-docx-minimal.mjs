import JSZip from 'jszip';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const fixturesDir = 'tests/test-fixtures/docx';
mkdirSync(fixturesDir, { recursive: true });

console.log('Creating minimal valid DOCX files...');

// Função para criar DOCX mínimo válido
async function createDocx(filename, paragraphs) {
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  // _rels/.rels
  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // word/_rels/document.xml.rels
  zip.folder('word').folder('_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  // word/document.xml
  const paragraphsXml = paragraphs.map(p => {
    if (p.bold) {
      return `    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${p.text}</w:t></w:r></w:p>`;
    } else if (p.italic) {
      return `    <w:p><w:r><w:rPr><w:i/></w:rPr><w:t>${p.text}</w:t></w:r></w:p>`;
    } else {
      return `    <w:p><w:r><w:t>${p.text}</w:t></w:r></w:p>`;
    }
  }).join('\n');

  zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
${paragraphsXml}
  </w:body>
</w:document>`);

  const content = await zip.generateAsync({ type: 'nodebuffer' });
  writeFileSync(join(fixturesDir, filename), content);
  console.log(`✓ ${filename}`);
}

// Criar fixtures
await createDocx('simple.docx', [
  { text: 'Hello World', bold: true },
  { text: 'This is a simple DOCX document' }
]);

await createDocx('formatted.docx', [
  { text: 'Heading 1', bold: true },
  { text: 'This is bold text', bold: true },
  { text: 'This is italic text', italic: true },
  { text: 'Regular paragraph text' }
]);

await createDocx('empty.docx', []);

console.log('\n✅ All DOCX fixtures created successfully!');


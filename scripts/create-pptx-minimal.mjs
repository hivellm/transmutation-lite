import JSZip from 'jszip';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const fixturesDir = 'tests/test-fixtures/pptx';
mkdirSync(fixturesDir, { recursive: true });

console.log('Creating minimal valid PPTX files...');

// Função para criar PPTX mínimo válido
async function createPptx(filename, slides) {
  const zip = new JSZip();

  // [Content_Types].xml
  const slideContentTypes = slides.map((_, i) => 
    `  <Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  ).join('\n');

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
${slideContentTypes}
</Types>`);

  // _rels/.rels
  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

  // ppt/_rels/presentation.xml.rels
  const slideRels = slides.map((_, i) => 
    `  <Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
  ).join('\n');

  zip.folder('ppt').folder('_rels').file('presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${slideRels}
</Relationships>`);

  // ppt/presentation.xml
  const slideIds = slides.map((_, i) => 
    `      <p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`
  ).join('\n');

  zip.folder('ppt').file('presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
${slideIds}
  </p:sldIdLst>
</p:presentation>`);

  // Criar slides
  slides.forEach((slide, i) => {
    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p>
            <a:r>
              <a:t>${slide.title}</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:t>${slide.content || ''}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    zip.folder('ppt').folder('slides').file(`slide${i + 1}.xml`, slideXml);
  });

  const content = await zip.generateAsync({ type: 'nodebuffer' });
  writeFileSync(join(fixturesDir, filename), content);
  console.log(`✓ ${filename}`);
}

// Criar fixtures
await createPptx('simple.pptx', [
  { title: 'Slide 1', content: 'Welcome to the Presentation' }
]);

await createPptx('multi-slide.pptx', [
  { title: 'Slide 1', content: 'First slide content' },
  { title: 'Slide 2', content: 'Second slide content' },
  { title: 'Slide 3', content: 'Third slide content' }
]);

await createPptx('empty.pptx', []);

console.log('\n✅ All PPTX fixtures created successfully!');


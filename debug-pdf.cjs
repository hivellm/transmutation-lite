const pdf = require('pdf-parse');

console.log('typeof pdf:', typeof pdf);
console.log('pdf is function:', typeof pdf === 'function');
console.log('pdf.default:', typeof pdf.default);
console.log('pdf keys:', Object.keys(pdf));

if (pdf.PDFParse) {
    console.log('Has PDFParse class');
    const parser = new pdf.PDFParse();
    console.log('parser type:', typeof parser);
    console.log('parser.parse:', typeof parser.parse);
}


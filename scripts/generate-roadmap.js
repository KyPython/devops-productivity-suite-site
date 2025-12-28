const fs = require('fs');
const path = require('path');
const markdownPdf = require('markdown-pdf');

const INPUT_FILE = 'week_2_day_8_9.md';
const OUTPUT_FILE = 'public/DevOps_Productivity_Suite_Mastery_Roadmap.pdf';

const inputPath = path.join(__dirname, '..', INPUT_FILE);
const outputPath = path.join(__dirname, '..', OUTPUT_FILE);

// Ensure public directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

console.log(`Generating PDF from ${INPUT_FILE}...`);

markdownPdf()
  .from(inputPath)
  .to(outputPath, () => {
    console.log(`✅ PDF generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
  });
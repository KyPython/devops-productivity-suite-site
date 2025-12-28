const fs = require('fs');
const path = require('path');
const markdownPdf = require('markdown-pdf');

const INPUT_FILE = 'week_2_day_10_11.md';
const OUTPUT_FILE = 'public/DevOps_Suite_Client_Scenarios.pdf';

const inputPath = path.join(__dirname, '..', INPUT_FILE);
const outputPath = path.join(__dirname, '..', OUTPUT_FILE);

// Ensure public directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

console.log(`Generating Client Scenarios PDF from ${INPUT_FILE}...`);

markdownPdf()
  .from(inputPath)
  .to(outputPath, () => {
    console.log(`✅ Client Scenarios generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
  });
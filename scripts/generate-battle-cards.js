const fs = require('fs');
const path = require('path');
const markdownPdf = require('markdown-pdf');

const INPUT_FILE = 'sales_battle_cards.md';
const OUTPUT_FILE = 'public/DevOps_Suite_Battle_Cards.pdf';

const inputPath = path.join(__dirname, '..', INPUT_FILE);
const outputPath = path.join(__dirname, '..', OUTPUT_FILE);

// Ensure public directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

console.log(`Generating Battle Cards PDF from ${INPUT_FILE}...`);

markdownPdf()
  .from(inputPath)
  .to(outputPath, () => {
    console.log(`✅ Battle Cards generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
  });
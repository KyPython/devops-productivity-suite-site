#!/usr/bin/env node

/**
 * Generate PDF from DevOps Automation Checklist HTML
 */

const fs = require('fs');
const path = require('path');

// Try to use puppeteer for HTML to PDF conversion
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.log('puppeteer not found, will provide manual instructions...');
}

const htmlPath = path.join(__dirname, '../public/checklist.html');
const outputPath = path.join(__dirname, '../public/DevOps_Automation_Checklist.pdf');

if (!fs.existsSync(htmlPath)) {
  console.error(`Error: Checklist HTML file not found at ${htmlPath}`);
  process.exit(1);
}

console.log('📄 Generating PDF from checklist HTML...');
console.log(`Input: ${htmlPath}`);
console.log(`Output: ${outputPath}`);

if (puppeteer) {
  (async () => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      
      // Read HTML file
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Set content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      await page.pdf({
        path: outputPath,
        format: 'Letter',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true
      });
      
      await browser.close();
      
      console.log('✅ PDF generated successfully!');
      console.log(`📁 Location: ${outputPath}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.log('\n📝 Manual conversion:');
      console.log('   1. Open the HTML file in your browser');
      console.log(`   2. File: ${htmlPath}`);
      console.log('   3. Press Cmd+P (Mac) or Ctrl+P (Windows)');
      console.log('   4. Choose "Save as PDF"');
      process.exit(1);
    }
  })();
} else {
  console.log('⚠️  Puppeteer not installed. Install it with: npm install puppeteer');
  console.log('\n📝 Manual conversion:');
  console.log('   1. Open the HTML file in your browser');
  console.log(`   2. File: ${htmlPath}`);
  console.log('   3. Press Cmd+P (Mac) or Ctrl+P (Windows)');
  console.log('   4. Choose "Save as PDF"');
  console.log('\nOr install puppeteer: npm install puppeteer');
  console.log('Then run this script again to auto-generate the PDF.');
}


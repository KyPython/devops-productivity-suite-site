/**
 * Convert HTML Presentation to PDF
 * 
 * Usage:
 *   node scripts/convert-presentation-to-pdf.js
 * 
 * Requirements:
 *   - Puppeteer installed: npm install puppeteer
 *   - Or use Chrome headless mode
 */

const fs = require('fs');
const path = require('path');

async function convertToPDF() {
  try {
    // Check if puppeteer is available
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch (e) {
      console.log('Puppeteer not found. Install it with: npm install puppeteer');
      console.log('\nAlternative: Use browser print to PDF:');
      console.log('1. Open public/presentation.html in Chrome');
      console.log('2. Press Cmd/Ctrl + P');
      console.log('3. Select "Save as PDF"');
      console.log('4. Enable "Background graphics"');
      console.log('5. Save');
      return;
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Get absolute path to presentation
    const presentationPath = path.join(__dirname, '../public/presentation.html');
    const fileUrl = `file://${presentationPath}`;
    
    console.log(`Loading: ${fileUrl}`);
    await page.goto(fileUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for slides to render
    await page.waitForSelector('.slide', { timeout: 5000 });

    // Get all slides
    const slides = await page.$$('.slide');
    console.log(`Found ${slides.length} slides`);

    // For a single PDF with all slides, we'll need to scroll through them
    // Or create separate PDFs for each slide
    
    // Option 1: Create one PDF per slide (recommended for presentations)
    const outputDir = path.join(__dirname, '../public/presentation-slides');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('\nConverting slides to PDF...');
    for (let i = 0; i < slides.length; i++) {
      // Show the slide
      await page.evaluate((index) => {
        const allSlides = document.querySelectorAll('.slide');
        allSlides.forEach((slide, idx) => {
          slide.classList.toggle('active', idx === index);
        });
      }, i);

      // Wait for slide to be visible
      await page.waitForTimeout(500);

      // Generate PDF for this slide
      const pdfPath = path.join(outputDir, `slide-${i + 1}.pdf`);
      await page.pdf({
        path: pdfPath,
        width: '1920px',
        height: '1080px',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      });

      console.log(`✓ Slide ${i + 1}/${slides.length} converted`);
    }

    // Option 2: Create single PDF with all slides (alternative)
    // This requires more complex layout handling
    console.log('\n✓ All slides converted!');
    console.log(`PDFs saved to: ${outputDir}`);
    console.log('\nTo combine into one PDF:');
    console.log('  - Use Adobe Acrobat or online PDF merger');
    console.log('  - Or use: pdfunite slide-*.pdf combined.pdf');

    await browser.close();
  } catch (error) {
    console.error('Error converting to PDF:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  convertToPDF();
}

module.exports = { convertToPDF };


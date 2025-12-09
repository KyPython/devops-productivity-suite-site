#!/usr/bin/env node

/**
 * Generate PDF from DevOps Automation Checklist markdown
 */

const fs = require('fs');
const path = require('path');

// Try to use markdown-pdf if available
let markdownPdf;
try {
  markdownPdf = require('markdown-pdf');
} catch (e) {
  console.log('markdown-pdf not found, trying alternative method...');
}

const checklistPath = path.join(__dirname, '../BUSINESS_MATERIALS/MARKETING/DEVOPS_AUTOMATION_CHECKLIST.md');
const outputPath = path.join(__dirname, '../BUSINESS_MATERIALS/MARKETING/DevOps_Automation_Checklist.pdf');

if (!fs.existsSync(checklistPath)) {
  console.error(`Error: Checklist file not found at ${checklistPath}`);
  process.exit(1);
}

console.log('📄 Generating PDF from checklist...');
console.log(`Input: ${checklistPath}`);
console.log(`Output: ${outputPath}`);

if (markdownPdf) {
  // Use markdown-pdf library
  markdownPdf({
    paperFormat: 'Letter',
    paperOrientation: 'portrait',
    paperBorder: '1cm',
    renderDelay: 1000,
    cssPath: path.join(__dirname, 'checklist-styles.css')
  })
    .from(checklistPath)
    .to(outputPath, () => {
      console.log('✅ PDF generated successfully!');
      console.log(`📁 Location: ${outputPath}`);
    });
} else {
  // Fallback: Create HTML version that can be printed to PDF
  const markdown = fs.readFileSync(checklistPath, 'utf8');
  
  // Simple markdown to HTML converter
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevOps Automation Checklist</title>
    <style>
        @page {
            margin: 0.75in;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #1560BD;
            border-bottom: 3px solid #1560BD;
            padding-bottom: 10px;
        }
        h2 {
            color: #224C98;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h3 {
            color: #333;
            margin-top: 20px;
        }
        .priority-high { color: #dc3545; font-weight: bold; }
        .priority-medium { color: #ffc107; font-weight: bold; }
        .priority-low { color: #28a745; font-weight: bold; }
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        li {
            margin: 5px 0;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        hr {
            border: none;
            border-top: 2px solid #ddd;
            margin: 30px 0;
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            h1 { page-break-after: avoid; }
            h2 { page-break-after: avoid; }
        }
    </style>
</head>
<body>
`;

  // Convert markdown to HTML (basic conversion)
  html += markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$2</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
    .replace(/<p><li>/g, '<ul><li>')
    .replace(/<\/li><\/p>/g, '</li></ul>')
    .replace(/<p><hr><\/p>/g, '<hr>');

  html += `
</body>
</html>`;

  const htmlPath = outputPath.replace('.pdf', '.html');
  fs.writeFileSync(htmlPath, html);
  
  console.log('✅ HTML version created!');
  console.log(`📁 Location: ${htmlPath}`);
  console.log('\n📝 To convert to PDF:');
  console.log('   1. Open the HTML file in your browser');
  console.log('   2. Press Cmd+P (Mac) or Ctrl+P (Windows)');
  console.log('   3. Choose "Save as PDF"');
  console.log('\nOr install pandoc: brew install pandoc');
  console.log('Then run: pandoc DEVOPS_AUTOMATION_CHECKLIST.md -o DevOps_Automation_Checklist.pdf');
}


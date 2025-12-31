#!/usr/bin/env ts-node
/**
 * Accessibility testing script
 * Tests HTML files for accessibility issues
 * 
 * Note: This script requires a local server running on port 3000
 * For local testing: npx serve public -l 3000
 * For CI/CD: Use pa11y-ci which handles the server automatically
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const publicDir = path.join(__dirname, '..', 'public');
const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
const htmlFiles = [
  { path: '/', name: 'Landing Page' },
  { path: '/checklist.html', name: 'Checklist Page' },
  { path: '/presentation.html', name: 'Presentation Page' }
];

interface TestResult {
  name: string;
  url: string;
  passed: boolean;
  errors: string[];
}

async function testAccessibility(): Promise<void> {
  console.log('🔍 Running accessibility tests...\n');
  console.log(`Base URL: ${baseUrl}\n`);

  const results: TestResult[] = [];
  let hasErrors = false;

  // Check if files exist
  for (const file of htmlFiles) {
    const filePath = path.join(publicDir, file.path.replace(/^\//, ''));
    if (!fs.existsSync(filePath) && file.path !== '/') {
      console.warn(`⚠️  Warning: ${file.path} not found, skipping...`);
      continue;
    }

    const url = `${baseUrl}${file.path}`;
    console.log(`Testing ${file.name} (${url})...`);

    try {
      // Use pa11y to test the URL
      const result = execSync(
        `npx pa11y "${url}" --standard WCAG2AA --reporter cli --timeout 10000`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      results.push({
        name: file.name,
        url,
        passed: true,
        errors: []
      });

      console.log(`✅ ${file.name} passed accessibility checks\n`);
    } catch (error: any) {
      const errorOutput = error.stdout || error.stderr || error.message;
      const errors = errorOutput.split('\n').filter((line: string) => line.trim());

      results.push({
        name: file.name,
        url,
        passed: false,
        errors
      });

      hasErrors = true;
      console.error(`❌ ${file.name} failed accessibility checks:`);
      console.error(errorOutput);
      console.error('');
    }
  }

  // Summary
  console.log('\n📊 Accessibility Test Summary:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (!result.passed && result.errors.length > 0) {
      result.errors.slice(0, 5).forEach((error: string) => {
        console.log(`   - ${error}`);
      });
      if (result.errors.length > 5) {
        console.log(`   ... and ${result.errors.length - 5} more issues`);
      }
    }
  });

  console.log('='.repeat(50));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (hasErrors) {
    console.error('\n❌ Accessibility tests failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ All accessibility tests passed!');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  testAccessibility().catch((error) => {
    console.error('Error running accessibility tests:', error);
    process.exit(1);
  });
}

export { testAccessibility };


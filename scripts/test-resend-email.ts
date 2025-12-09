/**
 * Test script for Resend email service
 * 
 * Usage:
 * 1. Set environment variable: export RESEND_API_KEY=re_xxxxx
 * 2. Run: npx ts-node scripts/test-resend-email.ts
 */

import { emailService } from '../api/services/email-service';

async function testEmail() {
  // Check if API key is set
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ ERROR: RESEND_API_KEY environment variable not set!');
    console.log('\n📝 To set it:');
    console.log('   export RESEND_API_KEY=re_xxxxxxxxxxxxx');
    console.log('\n   Or create a .env file with:');
    console.log('   RESEND_API_KEY=re_xxxxxxxxxxxxx');
    process.exit(1);
  }

  console.log('📧 Testing Resend email service...\n');

  const testEmail = process.env.TEST_EMAIL || 'kyjahntsmith@gmail.com';
  
  const result = await emailService.sendEmail({
    to: testEmail,
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
  });

  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   To: ${testEmail}`);
  } else {
    console.error('❌ Failed to send email:');
    console.error(`   Error: ${result.error}`);
    process.exit(1);
  }
}

testEmail().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

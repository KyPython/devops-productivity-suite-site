# Test Email Setup Guide

Quick guide to verify your Resend email setup is working correctly.

## 🚀 Quick Test (2 minutes)

### Option 1: Test Script (Recommended)

1. **Set environment variables** (create `.env` file in project root):
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   FROM_EMAIL=onboarding@resend.dev
   FROM_NAME=DevOps Productivity Suite
   TEST_EMAIL=your-email@example.com
   ```

2. **Run the test script**:
   ```bash
   npx ts-node scripts/test-email-setup.ts
   ```

3. **Check your email inbox** - you should receive:
   - ✅ Simple test email
   - ✅ Checklist PDF email (with attachment)
   - ✅ Welcome email

### Option 2: Test via API Endpoint

If your project is deployed to Vercel:

```bash
curl -X POST https://your-domain.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Testing Resend Setup</h1><p>If you see this, it works!</p>"
  }'
```

### Option 3: Test Full Lead Capture Flow

Test the complete flow (lead capture → email sequence):

```bash
curl -X POST https://your-domain.vercel.app/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "firstname": "Test"
  }'
```

This will:
- ✅ Create contact in HubSpot (if configured)
- ✅ Send Checklist PDF email (immediate)
- ✅ Send Welcome email (immediate)
- ✅ Schedule delayed emails (Day 3, 6, 10, 14)

---

## ✅ What to Check

After running tests, verify:

1. **Email received** - Check your inbox (and spam folder)
2. **From address** - Should show as `DevOps Productivity Suite <onboarding@resend.dev>`
3. **PDF attachment** - Checklist email should have PDF attached
4. **Email formatting** - HTML should render correctly
5. **Resend Dashboard** - Check https://resend.com/emails for delivery status

---

## 🔍 Troubleshooting

### ❌ "Email service not configured"
- **Fix**: Make sure `RESEND_API_KEY` is set in environment variables
- **Vercel**: Settings → Environment Variables → Add `RESEND_API_KEY`
- **Local**: Create `.env` file or `export RESEND_API_KEY=...`

### ❌ "Invalid from address"
- **Fix**: Verify `FROM_EMAIL` is correct
- **Test domain**: Use `onboarding@resend.dev`
- **Your domain**: Must be verified in Resend dashboard first

### ❌ Emails not received
1. Check spam/junk folder
2. Check Resend dashboard for errors: https://resend.com/emails
3. Verify API key is correct in Resend dashboard
4. Check email sending limits (free tier: 100 emails/day)

### ❌ PDF not attaching
- **Fix**: Ensure PDF exists at: `BUSINESS_MATERIALS/MARKETING/DevOps_Automation_Checklist.pdf`
- **Vercel**: File must be included in deployment (check `vercel.json`)

---

## 📊 Test Results Checklist

- [ ] Environment variables set correctly
- [ ] Simple test email received
- [ ] Checklist PDF email received (with attachment)
- [ ] Welcome email received
- [ ] Email formatting looks good
- [ ] From address shows correctly
- [ ] No errors in Resend dashboard

---

## 🎯 Next Steps

Once tests pass:

1. ✅ Deploy to Vercel (if not already)
2. ✅ Test on production URL
3. ✅ Submit form on landing page
4. ✅ Verify emails in production
5. ⏳ Set up cron job for delayed emails (optional)

---

## 💡 Tips

- **Test domain**: `onboarding@resend.dev` works immediately (no domain verification needed)
- **Your domain**: Better for production, but requires DNS verification
- **Email limits**: Free tier = 3,000/month, 100/day
- **Delivery**: Check Resend dashboard for real-time status

---

**Need help?** Check the Resend dashboard logs at https://resend.com/emails

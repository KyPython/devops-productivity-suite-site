# Quick Start: Email Automation Setup

## ✅ You're Already Set Up!

Your email automation is **already built** in Node.js. You just need to add your API key!

---

## 🚀 2-Minute Setup

### Step 1: Add API Key to Vercel (1 min)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add these variables:

```
RESEND_API_KEY = re_xxxxxxxxxxxxx
FROM_EMAIL = onboarding@resend.dev
FROM_NAME = DevOps Productivity Suite
```

**⚠️ SECURITY WARNING:** Never hardcode your API key in code! Always use environment variables.

4. Click **"Save"**
5. **Redeploy** your project (or it will auto-deploy on next push)

### Step 2: Test It (1 min)

1. Go to your landing page
2. Submit the form with your email
3. Check your inbox - you should receive:
   - ✅ Checklist PDF email (immediate)
   - ✅ Welcome email (immediate)

---

## 📧 How It Works

**Yes, we're using Node.js!** Here's the flow:

1. **User submits form** → Frontend calls `/api/lead-capture`
2. **Node.js API endpoint** (`api/lead-capture.ts`) receives request
3. **Email service** (`api/services/email-service.ts`) uses Resend SDK
4. **Emails sent automatically** via Resend API

**No manual work needed** - it's all automated!

---

## 🎯 What Happens When Someone Submits

1. ✅ Contact created in HubSpot (if API key set)
2. ✅ Checklist PDF email sent immediately
3. ✅ Welcome email sent immediately
4. ⏳ Other emails scheduled (Day 3, 6, 10, 14) - need scheduler for these

---

## 🧪 Test Email Sending

You can test the email service directly:

```bash
curl -X POST https://your-domain.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test from Node.js!</h1>"
  }'
```

---

## ✅ You're Done!

Once you add the API key to Vercel and redeploy:
- ✅ Emails will send automatically
- ✅ PDF will attach automatically
- ✅ All 5 email templates ready
- ✅ Works independently of HubSpot

**No additional code needed** - it's all built!

---

## 🔧 Troubleshooting

### Emails not sending?
- ✅ Check API key is set in Vercel
- ✅ Redeploy after adding environment variables
- ✅ Check Resend dashboard for errors
- ✅ Verify `FROM_EMAIL` is correct

### Want to customize emails?
- Edit `api/templates/email-templates.ts`
- Redeploy
- Done!

---

## 📊 Current Status

- ✅ Node.js email service built
- ✅ Resend integration ready
- ✅ Email templates created
- ✅ PDF attachment support
- ⏳ Add API key to Vercel (you're here!)
- ⏳ Test form submission
- ⏳ Set up scheduler for delayed emails (optional)

**You're 90% done!** Just add the API key and test.


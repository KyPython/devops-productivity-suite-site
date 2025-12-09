# 🧪 How to Test Your Email Setup

## Step 1: Wait for Vercel Deployment (1-2 minutes)

After pushing, Vercel will automatically deploy. Check your Vercel dashboard:
- Deployment status: https://vercel.com/dashboard
- Your deployment URL: `https://ubiquitous-automation.vercel.app` (or your custom domain)

---

## Step 2: Set Environment Variables in Vercel

**Before testing, make sure environment variables are set:**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these variables:
   ```
   RESEND_API_KEY=re_KaMJaBtJ_J6S6rgnLGLPJAfd3i8kS6dGx
   FROM_EMAIL=onboarding@resend.dev
   FROM_NAME=DevOps Productivity Suite
   ```
3. Click **Save**
4. **Important:** Redeploy (or wait for next auto-deploy) for env vars to take effect

---

## Step 3: Test the Landing Page

### Option A: Visit Your Site
1. Go to: `https://ubiquitous-automation.vercel.app` (or your custom domain)
2. You should see your landing page
3. Fill out the form with your email
4. Submit and check your inbox!

### Option B: Test API Directly (Faster)

**Test 1: Simple Email**
```bash
curl -X POST https://ubiquitous-automation.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "kyjahntsmith@gmail.com",
    "subject": "Test Email - Is This Working?",
    "html": "<h1>Testing Resend Setup</h1><p>If you received this, it works!</p>"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "re_xxxxx",
  "message": "Email sent successfully"
}
```

**Test 2: Full Lead Capture Flow**
```bash
curl -X POST https://ubiquitous-automation.vercel.app/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kyjahntsmith@gmail.com",
    "firstname": "Test"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Thank you! Check your email for the DevOps Automation Checklist.",
  "contactId": "...",
  "email": "kyjahntsmith@gmail.com"
}
```

**What happens:**
- ✅ Checklist PDF email sent (with attachment)
- ✅ Welcome email sent
- ✅ Other emails scheduled (Day 3, 6, 10, 14)

---

## Step 4: Check Your Email

1. **Check inbox** at `kyjahntsmith@gmail.com`
2. **Check spam folder** (emails might go there initially)
3. **Check Resend Dashboard**: https://resend.com/emails
   - See delivery status
   - Check if emails were sent successfully
   - View any errors

---

## Step 5: Verify Everything Works

✅ **Landing page loads** at root URL  
✅ **Form submits** successfully  
✅ **Emails received** in inbox  
✅ **PDF attachment** included in checklist email  
✅ **Welcome email** received  
✅ **No errors** in Resend dashboard  

---

## 🐛 Troubleshooting

### Landing page not showing?
- Wait 1-2 minutes for deployment to finish
- Check Vercel deployment logs
- Verify `vercel.json` is in the repo

### "Email service not configured" error?
- Check `RESEND_API_KEY` is set in Vercel
- **Redeploy** after adding environment variables
- Check Vercel logs for errors

### Emails not received?
1. Check **spam folder**
2. Check **Resend dashboard** (https://resend.com/emails)
3. Verify API key is correct
4. Check email sending limits (free tier: 100/day)

### API returns error?
- Check Vercel function logs
- Verify request format matches examples above
- Check CORS if calling from browser console

---

## 🎯 Quick Test Checklist

- [ ] Landing page loads at root URL
- [ ] Environment variables set in Vercel
- [ ] Simple email test works (curl command)
- [ ] Lead capture test works (curl command)
- [ ] Emails received in inbox
- [ ] PDF attachment received
- [ ] No errors in Resend dashboard
- [ ] Form on landing page works

---

## 💡 Pro Tips

1. **Test with curl first** - faster than filling out the form
2. **Check Resend dashboard** - shows delivery status in real-time
3. **Use your real email** - test the actual user experience
4. **Check spam folder** - new "from" addresses often go there initially

---

**Ready to test?** Start with the curl commands above - they're the fastest way to verify everything works!

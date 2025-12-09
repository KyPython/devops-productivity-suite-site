# Environment Variables Setup

## Required for Email Automation

Set these in Vercel → Settings → Environment Variables:

### Resend (Email Service)

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Get your key:**
1. Go to https://resend.com
2. Sign up (free: 3,000 emails/month)
3. API Keys → Create API Key
4. Copy the key

### Email From Address

```
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=DevOps Productivity Suite
```

**Important:**
- `FROM_EMAIL` must be a verified domain in Resend
- For testing: Use `onboarding@resend.dev` (Resend's test domain)
- For production: Add your domain in Resend and verify DNS

---

## Optional: HubSpot Integration

If you want to keep HubSpot contact sync:

```
HUBSPOT_API_KEY=your-hubspot-api-key
HUBSPOT_PORTAL_ID=your-portal-id
```

**Note:** Email automation works WITHOUT HubSpot. HubSpot is only for contact management.

---

## Quick Setup

1. **Get Resend API Key** (2 min)
   - Sign up at resend.com
   - Create API key

2. **Set in Vercel** (1 min)
   - Project → Settings → Environment Variables
   - Add `RESEND_API_KEY`
   - Add `FROM_EMAIL` (use `onboarding@resend.dev` for testing)
   - Add `FROM_NAME`

3. **Verify Domain** (if using your own domain)
   - Resend → Domains → Add domain
   - Add DNS records
   - Update `FROM_EMAIL` once verified

4. **Test**
   - Submit form on landing page
   - Check email inbox

---

## Testing

### Test Email Endpoint

```bash
curl -X POST https://your-domain.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

---

## Troubleshooting

### "Email service not configured"
- Check `RESEND_API_KEY` is set in Vercel
- Redeploy after adding environment variables

### "Invalid from address"
- Verify domain in Resend dashboard
- Use `onboarding@resend.dev` for testing

### Emails not sending
- Check Resend dashboard for errors
- Verify API key is correct
- Check email limits (free tier: 100/day)


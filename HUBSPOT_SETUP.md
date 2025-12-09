# HubSpot Integration Setup Guide

This guide explains how to set up HubSpot form capture and email sequence automation.

## Overview

The system now:
1. ✅ Captures leads via HubSpot form embed code
2. ✅ Automatically starts email sequences when forms are submitted
3. ✅ Stops sending emails when someone replies (checks HubSpot for engagement)
4. ✅ Uses first-person copy ("I" instead of "we")
5. ✅ Removed fake customer stories

## Setup Steps

### 1. Create HubSpot Form

1. Go to **HubSpot > Marketing > Forms**
2. Click **"Create form"**
3. Add fields:
   - **Email** (required)
   - **First Name** (required)
4. Configure form settings:
   - Form name: "DevOps Checklist Download"
   - Thank you message: "Check your email for the DevOps Automation Checklist!"
5. Save the form

### 2. Get Form Embed Code

1. In your HubSpot form, click **"Options"** > **"Embed"**
2. Copy the embed code (it will look like this):
   ```html
   <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2.js"></script>
   <script>
     hbspt.forms.create({
       region: "na1",
       portalId: "YOUR_PORTAL_ID",
       formId: "YOUR_FORM_ID",
       target: '.lead-capture-form-wrapper'
     });
   </script>
   ```

### 3. Add Form to Landing Page

1. Open `public/landing.html`
2. Find the section with `<!-- HubSpot Form Embed Code -->` (around line 1256)
3. Replace the commented-out code with your actual HubSpot form embed code
4. Remove or comment out the fallback form if desired

### 4. Set Up HubSpot Webhook (Optional but Recommended)

To automatically trigger email sequences when forms are submitted:

1. Go to **HubSpot > Settings > Integrations > Private Apps**
2. Create a new private app or use existing one
3. Go to **Settings > Integrations > Webhooks**
4. Create a new webhook:
   - **Event**: Form submission
   - **URL**: `https://your-domain.vercel.app/api/webhooks/hubspot-form`
   - **Method**: POST
   - **Form**: Select your DevOps Checklist form
5. Save the webhook

**Note**: The email sequence will still work without the webhook (via the JavaScript handler), but the webhook is more reliable.

### 5. Configure Environment Variables

Make sure these are set in Vercel:

```
HUBSPOT_API_KEY=your_hubspot_api_key
HUBSPOT_PORTAL_ID=your_portal_id
```

To get your API key:
1. Go to **HubSpot > Settings > Integrations > Private Apps**
2. Create or select an app
3. Copy the API key
4. Make sure it has these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `forms-uploaded-files.read`

### 6. Test the Integration

1. Submit a test form on your landing page
2. Check HubSpot to confirm the contact was created
3. Check your email to confirm the checklist email was sent
4. Reply to one of the sequence emails
5. Wait for the next scheduled email - it should be skipped because you replied

## How It Works

### Email Sequence Flow

1. **Form Submission**: User submits HubSpot form
2. **Lead Capture**: Contact created/updated in HubSpot
3. **Email Sequence Start**: 
   - Immediate: Checklist PDF email + Welcome email
   - Day 3: Pain Point email
   - Day 6: ROI email
   - Day 10: Social Proof email
   - Day 14: Final Push email
   - Day 21: Follow-up email

### Reply Detection

Before sending each scheduled email, the system:
1. Checks HubSpot for the contact's engagement status
2. Looks for:
   - `hs_email_replied` = true
   - `hs_email_optout` = true
   - Recent email engagement (replies, clicks, opens)
3. If contact has replied or opted out, skips sending the email

### Email Copy Changes

All emails now use:
- ✅ First-person ("I" instead of "we")
- ✅ No fake customer stories
- ✅ Honest, authentic messaging

## Troubleshooting

### Emails not being sent

1. Check `RESEND_API_KEY` is set in Vercel
2. Check Resend dashboard for delivery status
3. Check Vercel function logs for errors

### HubSpot webhook not working

1. Verify webhook URL is correct
2. Check HubSpot webhook logs
3. Verify API key has correct permissions
4. Check Vercel function logs at `/api/webhooks/hubspot-form`

### Reply detection not working

1. Verify `HUBSPOT_API_KEY` is set
2. Check HubSpot contact properties are being updated
3. Check cron job logs at `/api/cron/process-email-queue`
4. Verify cron is running (check Vercel cron configuration)

## Manual Testing

### Test Form Submission

```bash
curl -X POST https://your-domain.vercel.app/api/webhooks/hubspot-form \
  -H "Content-Type: application/json" \
  -d '{
    "submissionData": {
      "email": "test@example.com",
      "firstname": "Test"
    }
  }'
```

### Test Reply Detection

1. Submit a form with your email
2. Reply to one of the sequence emails
3. Wait for next scheduled email time
4. Check logs to confirm it was skipped

## Next Steps

- [ ] Add your HubSpot form embed code to `landing.html`
- [ ] Set up HubSpot webhook (optional)
- [ ] Test form submission
- [ ] Test reply detection
- [ ] Monitor email delivery rates

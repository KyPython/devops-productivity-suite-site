# Email Deliverability Guide

## Why Emails Go to Spam

Your email went to spam because:

1. **Using Shared Domain** (`onboarding@resend.dev`)
   - Shared domains have lower reputation
   - Many senders use the same domain
   - Gmail flags these more aggressively

2. **Missing Unsubscribe Link**
   - Required by CAN-SPAM Act
   - Gmail checks for this
   - Missing it = spam signal

3. **Email Content Triggers**
   - Too many emojis (✅✅✅)
   - Promotional language ("Save 5+ hours!")
   - Multiple CTAs
   - Attachment in first email

## Quick Fixes (Immediate)

### 1. Add Unsubscribe Link ✅ (Done)
I've added an unsubscribe link to the email template. You need to:
- Replace `{{unsubscribe_url}}` with actual unsubscribe endpoint
- Create `/api/unsubscribe` endpoint
- Store unsubscribe preferences

### 2. Use Custom Domain (Best Solution)
**Set up custom domain in Resend:**

1. **Go to Resend Dashboard** → Domains
2. **Add your domain** (e.g., `yourdomain.com`)
3. **Add DNS records**:
   - SPF: `v=spf1 include:resend.com ~all`
   - DKIM: (provided by Resend)
   - DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
4. **Verify domain** (takes 24-48 hours)
5. **Update FROM_EMAIL** in Vercel:
   ```
   FROM_EMAIL=noreply@yourdomain.com
   ```

### 3. Improve Email Content

**Reduce spam triggers:**
- ✅ Keep emojis minimal (1-2 max)
- ✅ Less promotional language
- ✅ More personal, conversational tone
- ✅ Add plain text version
- ✅ Better subject line

### 4. Warm Up Domain (If New)

If using a new custom domain:
- Start with low volume (10-20 emails/day)
- Gradually increase over 2-4 weeks
- Monitor bounce/spam rates
- Build sender reputation

## Implementation Steps

### Step 1: Create Unsubscribe Endpoint

```typescript
// api/unsubscribe.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { email, token } = req.query;
  
  // Verify token and unsubscribe
  // Store in database
  
  res.status(200).json({ success: true, message: 'Unsubscribed' });
}
```

### Step 2: Update Email Template

Replace `{{unsubscribe_url}}` with:
```
https://your-domain.vercel.app/api/unsubscribe?email={email}&token={token}
```

### Step 3: Set Up Custom Domain

1. Add domain in Resend
2. Add DNS records
3. Wait for verification
4. Update environment variable

### Step 4: Improve Content

- Reduce emojis
- More personal tone
- Add plain text version
- Better subject lines

## Best Practices

### Email Content
- ✅ Personal greeting (use first name)
- ✅ Clear value proposition
- ✅ Single, clear CTA
- ✅ Unsubscribe link (required)
- ✅ Physical address (if required)
- ✅ Plain text version

### Technical
- ✅ SPF/DKIM/DMARC configured
- ✅ Custom domain (not shared)
- ✅ Proper email headers
- ✅ List-Unsubscribe header
- ✅ Consistent sending patterns

### Sending Patterns
- ✅ Don't send too many at once
- ✅ Maintain consistent volume
- ✅ Monitor bounce rates (< 2%)
- ✅ Monitor spam rates (< 0.1%)
- ✅ Clean your list regularly

## Monitoring

**Check Resend Dashboard:**
- Delivery rates
- Bounce rates
- Spam complaints
- Open rates

**Gmail Postmaster Tools:**
- Set up at: https://postmaster.google.com
- Monitor domain reputation
- Check spam rates

## Quick Wins

1. **Add unsubscribe link** ✅ (Done in code)
2. **Set up custom domain** (24-48 hours)
3. **Reduce emojis** (5 minutes)
4. **Add plain text version** (10 minutes)
5. **Improve subject line** (2 minutes)

## Subject Line Tips

**Current:** "Your DevOps Automation Checklist is ready!"

**Better options:**
- "Here's your DevOps checklist, [First Name]"
- "Your requested checklist is attached"
- "[First Name], your DevOps automation guide"

**Avoid:**
- ALL CAPS
- Excessive punctuation (!!!)
- Spam words ("FREE", "CLICK NOW", "URGENT")
- Too many emojis

## Next Steps

1. ✅ Unsubscribe link added to template
2. ⏳ Create unsubscribe endpoint
3. ⏳ Set up custom domain in Resend
4. ⏳ Update FROM_EMAIL environment variable
5. ⏳ Reduce emojis in email content
6. ⏳ Add plain text version
7. ⏳ Monitor deliverability

## Resources

- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
- [Gmail Postmaster Tools](https://postmaster.google.com)
- [CAN-SPAM Act Compliance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)


# DevOps Productivity Suite - Marketing Site

Marketing landing page and email automation for the DevOps Productivity Suite.

## Features

- 🎨 Marketing landing page
- 📧 Automated email sequences (Resend integration)
- 📎 PDF checklist delivery
- 🔄 Lead capture and HubSpot integration
- ⚡ Serverless API endpoints (Vercel)

## Quick Start

### 1. Deploy to Vercel

1. Connect this repo to Vercel
2. Set environment variables:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   FROM_EMAIL=onboarding@resend.dev
   FROM_NAME=DevOps Productivity Suite
   ```
3. Deploy!

### 2. Test

Visit your Vercel URL - the landing page will be served at the root.

## Documentation

- `HOW_TO_TEST.md` - Testing guide
- `ENV_VARIABLES.md` - Environment variable setup
- `QUICK_START_EMAILS.md` - Email setup guide

## API Endpoints

- `/api/lead-capture` - Form submission endpoint
- `/api/send-email` - Manual email sending (testing)

## Structure

```
.
├── api/
│   ├── lead-capture.ts       # Lead capture endpoint
│   ├── send-email.ts         # Email sending endpoint
│   ├── services/
│   │   ├── email-service.ts  # Resend email service
│   │   └── email-queue.ts    # Email sequence scheduling
│   ├── templates/
│   │   └── email-templates.ts # Email templates
│   └── utils/                # Shared utilities
├── public/
│   └── landing.html          # Marketing landing page
└── scripts/                  # Utility scripts
```

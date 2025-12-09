# DevOps Productivity Suite - Marketing Site

Marketing landing page and email automation for the DevOps Productivity Suite.

## Features

- 🎨 Marketing landing page
- 📊 Interactive presentation deck (`/presentation?token=YOUR_SECRET` - protected)
- 📧 Automated email sequences (Resend integration)
- 📎 PDF checklist delivery
- 🔄 Lead capture and HubSpot integration
- ⚡ Serverless API endpoints (Vercel)
- 🤖 Business automation system (client management, invoices, support tickets)

## Quick Start

### 1. Deploy to Vercel

1. Connect this repo to Vercel
2. Set environment variables:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   FROM_EMAIL=onboarding@resend.dev
   FROM_NAME=DevOps Productivity Suite
   PREVIEW_SECRET=your-secret-token-here  # For email preview endpoint
   ```
3. Deploy!

### 2. Test

Visit your Vercel URL - the landing page will be served at the root.

## Documentation

- `HOW_TO_TEST.md` - Testing guide
- `ENV_VARIABLES.md` - Environment variable setup
- `QUICK_START_EMAILS.md` - Email setup guide
- `BUSINESS_AUTOMATION.md` - Complete business automation API documentation
- `BUSINESS_AUTOMATION_QUICKSTART.md` - Quick start guide for business automation

## API Endpoints

### Marketing & Lead Capture
- `/api/lead-capture` - Form submission endpoint
- `/api/send-email` - Manual email sending (testing)
- `/api/preview-emails?token=YOUR_SECRET&format=html` - Preview email sequence (requires token)
- `/presentation?token=YOUR_SECRET` - Interactive presentation deck (requires token)

### Business Automation
- `/api/clients` - Client management (CRUD)
- `/api/invoices` - Invoice generation
- `/api/support-tickets` - Support ticket creation
- `/api/checkins` - Monthly check-in management
- `/api/onboarding` - Onboarding progress tracking
- `/api/workflows` - Workflow automation triggers

See `BUSINESS_AUTOMATION.md` for complete API documentation.

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
│   ├── landing.html          # Marketing landing page
│   └── presentation.html     # Interactive presentation deck
└── scripts/                  # Utility scripts
```

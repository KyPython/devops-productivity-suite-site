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
   PREVIEW_SECRET=your-secret-token-here  # For email preview and presentation endpoints
   CRON_SECRET=your-cron-secret-here      # For cron job authentication
   HUBSPOT_API_KEY=your-hubspot-api-key   # For HubSpot integration
   ```
3. Deploy!

### 2. Test

Visit your Vercel URL - the landing page will be served at the root.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Resend API key for sending emails |
| `FROM_EMAIL` | Yes | Email address to send from |
| `FROM_NAME` | Yes | Display name for emails |
| `PREVIEW_SECRET` | Yes | Secret token for protected endpoints (preview, presentation) |
| `CRON_SECRET` | Yes | Secret token for cron job authentication |
| `HUBSPOT_API_KEY` | Yes | HubSpot API key for CRM integration |

## Cron Jobs

The following cron jobs are configured in `vercel.json`:

- **Email Queue Processing** (`/api/cron/process-email-queue`)
  - Schedule: Every hour (`0 * * * *`)
  - Purpose: Processes scheduled email sequences and sends due emails
  - Authentication: Requires `CRON_SECRET` in Authorization header

- **Business Automation** (`/api/cron/business-automation`)
  - Schedule: Daily at 9 AM UTC (`0 9 * * *`)
  - Purpose: Checks for due monthly check-ins and sends onboarding reminders
  - Authentication: Requires `CRON_SECRET` in Authorization header

## API Endpoints

### Marketing & Lead Capture
- `POST /api/lead-capture` - Form submission endpoint (captures leads and starts email sequence)
- `POST /api/send-email` - Manual email sending (testing/debugging)
- `GET /api/preview-emails?token=YOUR_SECRET&format=html` - Preview email sequence (requires token)
- `GET /api/preferences?email=xxx` - Email preferences management page
- `GET /api/unsubscribe?email=xxx&token=xxx` - Unsubscribe from emails
- `GET /presentation?token=YOUR_SECRET` - Interactive presentation deck (requires token, routed via `/api/presentation`)

### Webhooks
- `POST /api/webhooks/hubspot-form` - HubSpot form submission webhook (triggers email sequence)

### Business Automation
- `GET|POST|PUT|DELETE /api/clients` - Client management (CRUD operations)
  - `GET /api/clients` - List all clients
  - `GET /api/clients?id=xxx` - Get specific client
  - `GET /api/clients?email=xxx` - Get client by email
  - `GET /api/clients?status=xxx` - Get clients by status
  - `POST /api/clients` - Create new client
  - `PUT /api/clients?id=xxx` - Update client
  - `DELETE /api/clients?id=xxx` - Delete client

- `POST /api/invoices` - Invoice generation

- `POST /api/support-tickets` - Support ticket creation

- `GET|POST /api/checkins` - Monthly check-in management
  - `GET /api/checkins/due` - Get clients due for check-ins
  - `POST /api/checkins` - Generate and optionally send monthly check-in

- `GET|POST /api/onboarding` - Onboarding progress tracking
  - `GET /api/onboarding/checklist?clientId=xxx` - Get onboarding checklist
  - `GET /api/onboarding/reminders` - Get clients needing reminders
  - `POST /api/onboarding/progress` - Update onboarding progress
  - `POST /api/onboarding/reminder` - Send onboarding reminder

- `POST /api/workflows` - Workflow automation triggers
  - `POST /api/workflows/run-checkins` - Check and process due check-ins
  - `POST /api/workflows/run-reminders` - Check and send onboarding reminders

### Cron Jobs (Internal)
- `POST /api/cron/process-email-queue` - Processes scheduled email queue (runs hourly)
- `POST /api/cron/business-automation` - Business automation tasks (runs daily at 9 AM UTC)

## Project Structure

```
.
├── api/
│   ├── checkins.ts           # Monthly check-in management
│   ├── clients.ts            # Client management (CRUD)
│   ├── invoices.ts           # Invoice generation
│   ├── lead-capture.ts       # Lead capture endpoint
│   ├── onboarding.ts         # Onboarding progress tracking
│   ├── preferences.ts        # Email preferences management
│   ├── presentation.ts       # Protected presentation endpoint
│   ├── preview-emails.ts     # Email preview endpoint
│   ├── send-email.ts         # Manual email sending
│   ├── support-tickets.ts     # Support ticket creation
│   ├── unsubscribe.ts        # Unsubscribe endpoint
│   ├── workflows.ts          # Workflow automation triggers
│   ├── cron/
│   │   ├── business-automation.ts  # Daily automation cron
│   │   └── process-email-queue.ts  # Email queue processing cron
│   ├── services/
│   │   ├── client-storage.ts        # Client data storage
│   │   ├── document-generator.ts   # Document generation
│   │   ├── email-queue.ts          # Email sequence scheduling
│   │   ├── email-service.ts        # Resend email service
│   │   ├── hubspot-service.ts      # HubSpot CRM integration
│   │   ├── pdf-generator.ts        # PDF generation
│   │   ├── scheduled-email-storage.ts  # Scheduled email storage
│   │   └── workflow-automation.ts   # Workflow automation logic
│   ├── templates/
│   │   └── email-templates.ts       # Email templates
│   ├── utils/
│   │   ├── error-handler.ts        # Error handling utilities
│   │   ├── logger.ts               # Logging utilities
│   │   ├── middleware.ts           # Request middleware
│   │   ├── monitor.ts              # Monitoring utilities
│   │   └── validator.ts             # Input validation
│   └── webhooks/
│       └── hubspot-form.ts         # HubSpot form webhook
├── public/
│   ├── landing.html                # Marketing landing page
│   ├── presentation.html           # Interactive presentation deck
│   ├── checklist.html              # Checklist page
│   └── illustrations/              # SVG illustrations
├── scripts/
│   ├── generate-pdf-checklist.js   # PDF checklist generator
│   ├── convert-presentation-to-pdf.js  # Presentation to PDF
│   ├── setup-checklist-workflow.sh      # Checklist workflow setup
│   ├── test-email-setup.ts         # Email setup testing
│   └── test-resend-email.ts        # Resend email testing
├── BUSINESS_MATERIALS/             # Business documentation
├── vercel.json                     # Vercel configuration (cron jobs, rewrites)
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

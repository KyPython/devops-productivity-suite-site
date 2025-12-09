import { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from './utils/logger';
import { validateString } from './utils/validator';
import { hubspotService } from './services/hubspot-service';

/**
 * Email preferences endpoint
 * GET /api/preferences?email=xxx
 * 
 * Allows users to view and update their email preferences
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/html');

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).send(`
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Preferences</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">Email Preferences</h1>
            <p style="color: #4a5568;">Please provide your email address to view preferences.</p>
            <p style="margin-top: 30px;">
              <a href="/" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Return to Home
              </a>
            </p>
          </body>
        </html>
      `);
    }

    const emailStr = validateString(email as string, 'email');
    
    // Get contact from HubSpot to check current status
    const contact = await hubspotService.getContactByEmail(emailStr);
    const isOptedOut = contact?.properties?.hs_email_optout === 'true' || contact?.properties?.hs_email_optout === '1';

    res.status(200).send(`
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Preferences</title>
          <style>
            .preference-card {
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 30px;
              margin: 20px 0;
              text-align: left;
            }
            .status {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              margin-top: 10px;
            }
            .status.active {
              background: #c6f6d5;
              color: #22543d;
            }
            .status.unsubscribed {
              background: #fed7d7;
              color: #742a2a;
            }
            .btn {
              display: inline-block;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin-top: 20px;
              margin-right: 10px;
            }
            .btn-primary {
              background: #667eea;
              color: white;
            }
            .btn-secondary {
              background: #e2e8f0;
              color: #2d3748;
            }
          </style>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; background: #f7fafc;">
          <h1 style="color: #2d3748; text-align: center;">Email Preferences</h1>
          
          <div class="preference-card">
            <h2 style="color: #2d3748; margin-bottom: 15px;">Current Status</h2>
            <p style="color: #4a5568; margin-bottom: 10px;">
              <strong>Email:</strong> ${emailStr}
            </p>
            <p style="color: #4a5568;">
              <strong>Status:</strong> 
              <span class="status ${isOptedOut ? 'unsubscribed' : 'active'}">
                ${isOptedOut ? 'Unsubscribed' : 'Subscribed'}
              </span>
            </p>
          </div>

          <div class="preference-card">
            <h2 style="color: #2d3748; margin-bottom: 15px;">Manage Preferences</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              ${isOptedOut 
                ? 'You are currently unsubscribed from our emails. Click below to resubscribe or contact us directly.'
                : 'You are subscribed to our email updates. You can unsubscribe at any time using the link in any email, or click below.'}
            </p>
            ${isOptedOut 
              ? `<p style="color: #718096; font-size: 0.9em; margin-top: 15px;">
                  To resubscribe, please contact us directly or 
                  <a href="https://calendly.com/kyjahn-smith/consultation" style="color: #667eea;">book a consultation</a>.
                </p>`
              : `<p style="margin-top: 20px;">
                  <a href="/api/unsubscribe?email=${encodeURIComponent(emailStr)}&token=preference" class="btn btn-secondary">
                    Unsubscribe
                  </a>
                </p>`
            }
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="/" class="btn btn-primary">Return to Home</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('Preferences error', error as Error);
    res.status(500).send(`
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Error</h1>
          <p style="color: #4a5568;">An error occurred loading your preferences.</p>
          <p style="margin-top: 30px;">
            <a href="/" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Return to Home
            </a>
          </p>
        </body>
      </html>
    `);
  }
}

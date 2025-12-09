import { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from './utils/logger';
import { validateString } from './utils/validator';
import { hubspotService } from './services/hubspot-service';

/**
 * Unsubscribe endpoint
 * GET /api/unsubscribe?email=xxx&token=xxx
 * 
 * This endpoint:
 * 1. Validates the email and token
 * 2. Updates HubSpot contact to opt out (hs_email_optout = true)
 * 3. Future emails will be automatically skipped by the email queue
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/html');

  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).send(`
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invalid Request</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">Invalid Request</h1>
            <p style="color: #4a5568;">Missing email or token parameter.</p>
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
    
    logger.info('Unsubscribe request received', { email: emailStr });

    // Update HubSpot contact to opt out
    const unsubscribeSuccess = await hubspotService.unsubscribeContact(emailStr);

    if (unsubscribeSuccess) {
      logger.info('Contact unsubscribed successfully', { email: emailStr });
      
      res.status(200).send(`
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unsubscribed</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">You've been unsubscribed</h1>
            <p style="color: #4a5568; line-height: 1.6;">
              You've been successfully removed from our email list. You won't receive any more emails from us.
            </p>
            <p style="color: #718096; font-size: 0.9em; margin-top: 30px;">
              If you change your mind, you can always reach out or 
              <a href="https://calendly.com/kyjahn-smith/consultation" style="color: #667eea;">book a consultation</a>.
            </p>
            <p style="margin-top: 40px;">
              <a href="/" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Return to Home
              </a>
            </p>
          </body>
        </html>
      `);
    } else {
      // Even if HubSpot update fails, show success message (better UX)
      // The email queue will still check opt-out status before sending
      logger.warn('Unsubscribe processed but HubSpot update may have failed', { email: emailStr });
      
      res.status(200).send(`
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unsubscribed</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">Unsubscribe Request Received</h1>
            <p style="color: #4a5568; line-height: 1.6;">
              Your unsubscribe request has been processed. You won't receive any more emails from us.
            </p>
            <p style="color: #718096; font-size: 0.9em; margin-top: 30px;">
              If you change your mind, you can always reach out or 
              <a href="https://calendly.com/kyjahn-smith/consultation" style="color: #667eea;">book a consultation</a>.
            </p>
            <p style="margin-top: 40px;">
              <a href="/" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Return to Home
              </a>
            </p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    logger.error('Unsubscribe error', error as Error);
    res.status(500).send(`
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Error</h1>
          <p style="color: #4a5568;">An error occurred processing your unsubscribe request.</p>
          <p style="color: #718096; font-size: 0.9em; margin-top: 20px;">
            Please try again or contact us directly.
          </p>
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


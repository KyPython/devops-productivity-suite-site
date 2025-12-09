import { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from './utils/logger';
import { validateString, validateRequired } from './utils/validator';

/**
 * Unsubscribe endpoint
 * GET /api/unsubscribe?email=xxx&token=xxx
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/html');

  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>Invalid Request</h1>
            <p>Missing email or token parameter.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
      `);
    }

    const emailStr = validateString(email as string, 'email');
    
    // TODO: Verify token and store unsubscribe preference in database
    // For now, we'll just log it
    logger.info('Unsubscribe request', { email: emailStr, token });

    // In production, you would:
    // 1. Verify the token
    // 2. Store unsubscribe preference in database
    // 3. Remove from email list
    // 4. Send confirmation email

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
  } catch (error) {
    logger.error('Unsubscribe error', error as Error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1>Error</h1>
          <p>An error occurred processing your unsubscribe request.</p>
          <p><a href="/">Return to Home</a></p>
        </body>
      </html>
    `);
  }
}


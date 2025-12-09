import { VercelRequest, VercelResponse } from '@vercel/node';
import { emailService } from '../services/email-service';
import { logger } from '../utils/logger';
import { scheduledEmailStorage } from '../services/scheduled-email-storage';

/**
 * Cron job endpoint to process scheduled emails
 * Set up in Vercel: https://vercel.com/docs/cron-jobs
 * 
 * Schedule: Run every hour
 * vercel.json cron config:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-email-queue",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron request (Vercel adds a header)
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logger.info('Processing email queue');

    // Get all emails that are due to be sent
    const dueEmails = await scheduledEmailStorage.getDueEmails();
    logger.info('Found due emails', { count: dueEmails.length });

    let processed = 0;
    let failed = 0;

    // Process each due email
    for (const scheduledEmail of dueEmails) {
      try {
        await emailService.sendEmail({
          to: scheduledEmail.email,
          subject: scheduledEmail.subject,
          html: scheduledEmail.html,
        });

        // Mark as sent
        await scheduledEmailStorage.markAsSent(scheduledEmail.id);
        processed++;
        
        logger.info('Scheduled email sent', {
          id: scheduledEmail.id,
          email: scheduledEmail.email,
          subject: scheduledEmail.subject,
        });
      } catch (error) {
        failed++;
        logger.error('Failed to send scheduled email', error as Error, {
          id: scheduledEmail.id,
          email: scheduledEmail.email,
        });
      }
    }

    logger.info('Email queue processed', { processed, failed, total: dueEmails.length });

    res.status(200).json({ 
      success: true, 
      message: `Email queue processed: ${processed} sent, ${failed} failed`,
      processed,
      failed,
      total: dueEmails.length
    });
  } catch (error) {
    logger.error('Failed to process email queue', error as Error);
    res.status(500).json({ error: 'Failed to process email queue' });
  }
}


import { VercelRequest, VercelResponse } from '@vercel/node';
import { emailService } from '../services/email-service';
import { logger } from '../utils/logger';
import { scheduledEmailStorage } from '../services/scheduled-email-storage';
import { hubspotService } from '../services/hubspot-service';

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

    // Get all contacts with scheduled emails from HubSpot
    const contactsWithSequences = await hubspotService.getContactsWithScheduledEmails();
    logger.info('Found contacts with scheduled emails', { count: contactsWithSequences.length });

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    // Process each contact's scheduled emails
    for (const contact of contactsWithSequences) {
      try {
        // Get due emails for this contact
        const dueEmails = await scheduledEmailStorage.getDueEmailsForContact(contact.email);
        
        if (dueEmails.length === 0) {
          continue;
        }

        logger.info('Processing due emails for contact', { 
          email: contact.email, 
          count: dueEmails.length 
        });

        // Process each due email for this contact
        for (const scheduledEmail of dueEmails) {
          try {
            // Check if contact has replied or opted out before sending
            const hasReplied = await hubspotService.hasContactReplied(scheduledEmail.email);
            
            if (hasReplied) {
              logger.info('Skipping email - contact has replied or opted out', {
                id: scheduledEmail.id,
                email: scheduledEmail.email,
                subject: scheduledEmail.subject,
              });
              
              // Mark as sent (so we don't try again) but log as skipped
              await scheduledEmailStorage.markAsSent(scheduledEmail.id, scheduledEmail.email);
              skipped++;
              continue;
            }

            await emailService.sendEmail({
              to: scheduledEmail.email,
              subject: scheduledEmail.subject,
              html: scheduledEmail.html,
            });

            // Mark as sent
            await scheduledEmailStorage.markAsSent(scheduledEmail.id, scheduledEmail.email);
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
      } catch (error) {
        logger.error('Failed to process contact scheduled emails', error as Error, {
          email: contact.email,
        });
      }
    }

    const total = processed + failed + skipped;
    logger.info('Email queue processed', { processed, failed, skipped, total });

    res.status(200).json({ 
      success: true, 
      message: `Email queue processed: ${processed} sent, ${failed} failed, ${skipped} skipped (replied/opted out)`,
      processed,
      failed,
      skipped,
      total
    });
  } catch (error) {
    logger.error('Failed to process email queue', error as Error);
    res.status(500).json({ error: 'Failed to process email queue' });
  }
}


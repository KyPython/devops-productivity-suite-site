import { VercelRequest, VercelResponse } from '@vercel/node';
import { workflowAutomation } from '../services/workflow-automation';
import { logger } from '../utils/logger';
import { emailService } from '../services/email-service';

/**
 * Business Automation Cron Job
 * Runs daily to check for:
 * - Clients due for monthly check-ins
 * - Clients needing onboarding reminders
 * 
 * Schedule in Vercel: Daily at 9 AM UTC
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret (optional but recommended)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logger.info('Business automation cron job started');

    // Check for due check-ins
    const dueCheckins = await workflowAutomation.checkForDueCheckins();
    logger.info('Clients due for check-ins', { count: dueCheckins.length });

    // Check for onboarding reminders
    const reminders = await workflowAutomation.checkForOnboardingReminders();
    logger.info('Clients needing reminders', { count: reminders.length });

    // Process check-ins (send reminders)
    const checkinResults = await Promise.allSettled(
      dueCheckins.map(async (client) => {
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear().toString();
        
        await workflowAutomation.scheduleMonthlyCheckin(client.id, month, year);
        
        // Generate check-in document
        const checkinContent = await workflowAutomation.generateMonthlyCheckin(
          client.id,
          month,
          year
        );

        // Send email reminder
        await emailService.sendEmail({
          to: client.contact.email,
          subject: `Monthly Check-in Reminder - ${month} ${year}`,
          html: `
            <p>Hi ${client.contact.name},</p>
            <p>It's time for your monthly check-in for <strong>${client.company}</strong>.</p>
            <p>Please schedule a time to discuss your DevOps Productivity Suite usage and any questions you may have.</p>
            <p>Best regards,<br>DevOps Productivity Suite</p>
          `,
        });

        return { clientId: client.id, success: true };
      })
    );

    // Process onboarding reminders
    const reminderResults = await Promise.allSettled(
      reminders.map(async ({ client, reminderType }) => {
        await workflowAutomation.sendOnboardingReminder(client.id, reminderType);
        await workflowAutomation.updateOnboardingProgress(
          client.id,
          `${reminderType}_reminder_sent`,
          true
        );
        return { clientId: client.id, reminderType, success: true };
      })
    );

    const checkinSuccess = checkinResults.filter(r => r.status === 'fulfilled').length;
    const checkinFailed = checkinResults.filter(r => r.status === 'rejected').length;
    const reminderSuccess = reminderResults.filter(r => r.status === 'fulfilled').length;
    const reminderFailed = reminderResults.filter(r => r.status === 'rejected').length;

    logger.info('Business automation cron job completed', {
      checkins: { total: dueCheckins.length, success: checkinSuccess, failed: checkinFailed },
      reminders: { total: reminders.length, success: reminderSuccess, failed: reminderFailed },
    });

    return res.status(200).json({
      success: true,
      message: 'Business automation completed',
      results: {
        checkins: {
          total: dueCheckins.length,
          successful: checkinSuccess,
          failed: checkinFailed,
        },
        reminders: {
          total: reminders.length,
          successful: reminderSuccess,
          failed: reminderFailed,
        },
      },
    });
  } catch (error) {
    logger.error('Business automation cron job error', error as Error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}


import { VercelRequest, VercelResponse } from '@vercel/node';
import { withMonitoring } from './utils/middleware';
import { logger } from './utils/logger';
import { AppError, ErrorCode } from './utils/error-handler';
import { workflowAutomation } from './services/workflow-automation';
import { emailService } from './services/email-service';

/**
 * Workflow Automation API
 * POST /api/workflows/run-checkins - Check and process due check-ins
 * POST /api/workflows/run-reminders - Check and send onboarding reminders
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    throw new AppError(ErrorCode.NOT_FOUND, 'Method not allowed', 405);
  }

  try {
    if (req.url?.includes('/run-checkins')) {
      const dueClients = await workflowAutomation.checkForDueCheckins();
      
      const results = await Promise.allSettled(
        dueClients.map(async (client) => {
          const month = new Date().toLocaleString('default', { month: 'long' });
          const year = new Date().getFullYear().toString();
          
          // Schedule check-in
          await workflowAutomation.scheduleMonthlyCheckin(client.id, month, year);
          
          // Generate and send check-in
          const checkinContent = await workflowAutomation.generateMonthlyCheckin(
            client.id,
            month,
            year
          );

          // Send email
          await emailService.sendEmail({
            to: client.contact.email,
            subject: `Monthly Check-in Reminder - ${month} ${year}`,
            html: `<p>Hi ${client.contact.name},</p><p>It's time for your monthly check-in. Please schedule a time to discuss your DevOps Productivity Suite usage.</p><pre style="white-space: pre-wrap;">${checkinContent}</pre>`,
          });

          return { clientId: client.id, success: true };
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info('Check-in workflow executed', { total: dueClients.length, successful, failed });

      res.status(200).json({
        success: true,
        message: `Processed ${successful} check-ins, ${failed} failed`,
        processed: successful,
        failed,
        total: dueClients.length,
      });
    }

    if (req.url?.includes('/run-reminders')) {
      const reminders = await workflowAutomation.checkForOnboardingReminders();
      
      const results = await Promise.allSettled(
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

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info('Onboarding reminder workflow executed', { total: reminders.length, successful, failed });

      res.status(200).json({
        success: true,
        message: `Sent ${successful} reminders, ${failed} failed`,
        processed: successful,
        failed,
        total: reminders.length,
      });
    }

    throw new AppError(ErrorCode.BAD_REQUEST, 'Invalid workflow endpoint', 400);
  } catch (error) {
    logger.error('Workflow execution error', error as Error, { url: req.url });
    throw error;
  }
});


import { VercelRequest, VercelResponse } from '@vercel/node';
import { withMonitoring } from './utils/middleware';
import { logger } from './utils/logger';
import { AppError, ErrorCode } from './utils/error-handler';
import { workflowAutomation } from './services/workflow-automation';
import { emailService } from './services/email-service';
import { clientStorage } from './services/client-storage';
import { validateString, validateRequired } from './utils/validator';

/**
 * Monthly Check-in API
 * POST /api/checkins - Generate and optionally send monthly check-in
 * GET /api/checkins/due - Get clients due for check-ins
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    // GET - List clients due for check-ins
    if (req.method === 'GET') {
      if (req.url?.includes('/due')) {
        const dueClients = await workflowAutomation.checkForDueCheckins();
        return res.status(200).json({
          success: true,
          data: dueClients.map(c => ({
            id: c.id,
            company: c.company,
            contact: c.contact,
            lastCheckin: c.monthlyCheckins?.[c.monthlyCheckins.length - 1],
          })),
        });
      }

      throw new AppError(ErrorCode.NOT_FOUND, 'Endpoint not found', 404);
    }

    // POST - Generate monthly check-in
    if (req.method === 'POST') {
      const body = req.body || {};
      const clientId = validateString(
        validateRequired(body.clientId, 'clientId'),
        'clientId'
      );

      const month = body.month || new Date().toLocaleString('default', { month: 'long' });
      const year = body.year || new Date().getFullYear().toString();
      const sendEmail = body.sendEmail !== false; // Default to true

      // Generate check-in document
      const checkinContent = await workflowAutomation.generateMonthlyCheckin(
        clientId,
        month,
        year,
        {
          attendees: body.attendees,
          toolUsageReview: body.toolUsageReview,
          updates: body.updates,
          supportIssues: body.supportIssues,
          teamChanges: body.teamChanges,
          nextSteps: body.nextSteps,
          notes: body.notes,
          actionItems: body.actionItems,
          satisfaction: body.satisfaction,
          renewalDiscussion: body.renewalDiscussion,
        }
      );

      // Send email if requested
      if (sendEmail) {
        const client = await clientStorage.getClientById(clientId);
        if (!client) {
          throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
        }

        await emailService.sendEmail({
          to: client.contact.email,
          subject: `Monthly Check-in - ${month} ${year} - DevOps Productivity Suite`,
          html: `<pre style="white-space: pre-wrap; font-family: monospace;">${checkinContent.replace(/\n/g, '<br>')}</pre>`,
        });

        logger.info('Monthly check-in sent via email', { clientId, month, year });
      }

      logger.info('Monthly check-in generated', { clientId, month, year });

      return res.status(200).json({
        success: true,
        message: sendEmail ? 'Monthly check-in generated and sent' : 'Monthly check-in generated',
        data: checkinContent,
      });
    }

    throw new AppError(ErrorCode.NOT_FOUND, 'Method not allowed', 405);
  } catch (error) {
    logger.error('Check-in API error', error as Error, { body: req.body });
    throw error;
  }
});


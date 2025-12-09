import { VercelRequest, VercelResponse } from '@vercel/node';
import { withMonitoring } from './utils/middleware';
import { logger } from './utils/logger';
import { AppError, ErrorCode } from './utils/error-handler';
import { workflowAutomation } from './services/workflow-automation';
import { documentGenerator } from './services/document-generator';
import { validateString, validateRequired } from './utils/validator';
import { clientStorage } from './services/client-storage';

/**
 * Onboarding Management API
 * POST /api/onboarding/progress - Update onboarding progress
 * POST /api/onboarding/reminder - Send onboarding reminder
 * GET /api/onboarding/checklist?clientId=xxx - Get onboarding checklist
 * GET /api/onboarding/reminders - Get clients needing reminders
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    // GET - Get onboarding checklist
    if (req.method === 'GET') {
      const { clientId } = req.query;

      if (req.url?.includes('/reminders')) {
        const reminders = await workflowAutomation.checkForOnboardingReminders();
        return res.status(200).json({
          success: true,
          data: reminders,
        });
      }

      if (clientId && typeof clientId === 'string') {
        const client = await clientStorage.getClientById(clientId);
        if (!client) {
          throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
        }

        const checklist = documentGenerator.generateOnboardingChecklist(client);
        return res.status(200).json({
          success: true,
          data: checklist,
          client: {
            id: client.id,
            company: client.company,
            status: client.status,
            progress: client.onboardingProgress,
          },
        });
      }

      throw new AppError(ErrorCode.BAD_REQUEST, 'clientId query parameter required', 400);
    }

    // POST - Update progress or send reminder
    if (req.method === 'POST') {
      const body = req.body || {};

      if (req.url?.includes('/progress')) {
        const clientId = validateString(
          validateRequired(body.clientId, 'clientId'),
          'clientId'
        );
        const taskKey = validateString(
          validateRequired(body.taskKey, 'taskKey'),
          'taskKey'
        );
        const completed = body.completed === true;

        await workflowAutomation.updateOnboardingProgress(clientId, taskKey, completed);

        return res.status(200).json({
          success: true,
          message: 'Onboarding progress updated',
        });
      }

      if (req.url?.includes('/reminder')) {
        const clientId = validateString(
          validateRequired(body.clientId, 'clientId'),
          'clientId'
        );
        const reminderType = validateString(
          validateRequired(body.reminderType, 'reminderType'),
          'reminderType'
        ) as 'week1' | 'week2' | 'week3';

        await workflowAutomation.sendOnboardingReminder(clientId, reminderType);

        // Mark reminder as sent
        await workflowAutomation.updateOnboardingProgress(
          clientId,
          `${reminderType}_reminder_sent`,
          true
        );

        return res.status(200).json({
          success: true,
          message: 'Onboarding reminder sent',
        });
      }

      throw new AppError(ErrorCode.BAD_REQUEST, 'Invalid endpoint', 400);
    }

    throw new AppError(ErrorCode.NOT_FOUND, 'Method not allowed', 405);
  } catch (error) {
    logger.error('Onboarding API error', error as Error, { body: req.body, query: req.query });
    throw error;
  }
});


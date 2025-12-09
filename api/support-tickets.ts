import { VercelRequest, VercelResponse } from '@vercel/node';
import { withMonitoring } from './utils/middleware';
import { logger } from './utils/logger';
import { AppError, ErrorCode } from './utils/error-handler';
import { workflowAutomation } from './services/workflow-automation';
import { validateString, validateRequired } from './utils/validator';

/**
 * Support Ticket API
 * POST /api/support-tickets - Create support ticket
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    throw new AppError(ErrorCode.NOT_FOUND, 'Method not allowed', 405);
  }

  try {
    const body = req.body || {};
    const clientId = validateString(
      validateRequired(body.clientId, 'clientId'),
      'clientId'
    );

    const issueDescription = validateString(
      validateRequired(body.issueDescription, 'issueDescription'),
      'issueDescription',
      { minLength: 10 }
    );

    const status = body.status || 'open';
    const priority = body.priority || 'medium';

    const ticketContent = await workflowAutomation.createSupportTicket(clientId, {
      status: status as any,
      priority: priority as any,
      issueDescription,
      stepsToReproduce: Array.isArray(body.stepsToReproduce) ? body.stepsToReproduce : undefined,
      expectedBehavior: body.expectedBehavior,
      actualBehavior: body.actualBehavior,
      environment: body.environment ? {
        tool: body.environment.tool,
        techStack: body.environment.techStack,
        errorMessages: body.environment.errorMessages,
      } : undefined,
      resolution: body.resolution,
      resolutionDate: body.resolutionDate,
      followUp: body.followUp,
    });

    logger.info('Support ticket created', { clientId });

    res.status(201).json({
      success: true,
      message: 'Support ticket created',
      data: ticketContent,
    });
  } catch (error) {
    logger.error('Support ticket creation error', error as Error, { body: req.body });
    throw error;
  }
});


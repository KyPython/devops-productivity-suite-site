import { VercelRequest, VercelResponse } from '@vercel/node';
import { emailService } from './services/email-service';
import { withMonitoring } from './utils/middleware';
import { logger } from './utils/logger';
import { validateString, validateRequired } from './utils/validator';
import { AppError, ErrorCode } from './utils/error-handler';

/**
 * Manual email sending endpoint for testing
 * POST /api/send-email
 * Body: { to, subject, html }
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    throw new AppError(ErrorCode.NOT_FOUND, 'Method not allowed', 405);
  }

  try {
    const body = req.body || {};
    
    const to = validateString(
      validateRequired(body.to, 'to'),
      'to',
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    );
    
    const subject = validateString(
      validateRequired(body.subject, 'subject'),
      'subject',
      { minLength: 1, maxLength: 200 }
    );
    
    const html = validateString(
      validateRequired(body.html, 'html'),
      'html',
      { minLength: 1 }
    );

    logger.info('Manual email send request', { to, subject });

    const result = await emailService.sendEmail({
      to,
      subject,
      html
    });

    if (!result.success) {
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        result.error || 'Failed to send email',
        500
      );
    }

    res.status(200).json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    logger.error('Email send failed', error as Error, { body: req.body });
    throw error;
  }
});


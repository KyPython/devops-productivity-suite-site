import { VercelRequest, VercelResponse } from '@vercel/node';
import { withMonitoring } from './utils/middleware';
import { logger } from './utils/logger';
import { AppError, ErrorCode } from './utils/error-handler';
import { workflowAutomation } from './services/workflow-automation';
import { pdfGenerator } from './services/pdf-generator';
import { emailService } from './services/email-service';
import { clientStorage } from './services/client-storage';
import { validateString, validateRequired } from './utils/validator';

/**
 * Invoice Generation API
 * POST /api/invoices - Generate and optionally send invoice
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

    const monthYear = body.monthYear;
    const sendEmail = body.sendEmail !== false; // Default to true
    const format = body.format || 'markdown'; // 'markdown' or 'pdf'

    // Generate invoice
    const invoiceContent = await workflowAutomation.generateMonthlyInvoice(clientId, monthYear);

    logger.info('Invoice generated', { clientId, format });

    // If PDF format requested
    if (format === 'pdf') {
      const pdfBuffer = await pdfGenerator.generatePDF(invoiceContent);
      
      if (sendEmail) {
        // Send PDF via email
        const client = await clientStorage.getClientById(clientId);
        if (!client) {
          throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
        }

        await emailService.sendEmail({
          to: client.contact.email,
          subject: `Invoice - DevOps Productivity Suite`,
          html: `<p>Hi ${client.contact.name},</p><p>Please find your invoice attached.</p><p>Best regards,<br>DevOps Productivity Suite</p>`,
          attachments: [{
            filename: `invoice-${Date.now()}.pdf`,
            content: pdfBuffer,
            type: 'application/pdf',
          }],
        });

        logger.info('Invoice PDF sent via email', { clientId });
      }

      return res.status(200).json({
        success: true,
        message: sendEmail ? 'Invoice generated and sent' : 'Invoice generated',
        format: 'pdf',
      });
    }

    // If email requested with markdown
    if (sendEmail) {
      const client = await clientStorage.getClientById(clientId);
      if (!client) {
        throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
      }

      await emailService.sendEmail({
        to: client.contact.email,
        subject: `Invoice - DevOps Productivity Suite`,
        html: `<pre style="white-space: pre-wrap; font-family: monospace;">${invoiceContent.replace(/\n/g, '<br>')}</pre>`,
      });

      logger.info('Invoice markdown sent via email', { clientId });
    }

    return res.status(200).json({
      success: true,
      message: sendEmail ? 'Invoice generated and sent' : 'Invoice generated',
      data: invoiceContent,
      format: 'markdown',
    });
  } catch (error) {
    logger.error('Invoice generation error', error as Error, { body: req.body });
    throw error;
  }
});


import { Resend } from 'resend';
import { logger } from '../utils/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    type?: string;
  }>;
}

export class EmailService {
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
    this.fromName = process.env.FROM_NAME || 'DevOps Productivity Suite';
  }

  async sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('Resend API key not configured, skipping email send');
      if (process.env.NODE_ENV === 'development') {
        logger.info('Email would be sent:', { to: data.to, subject: data.subject });
        return { success: true, messageId: 'dev-mode' };
      }
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        attachments: data.attachments?.map(att => ({
          filename: att.filename,
          content: att.content instanceof Buffer 
            ? att.content.toString('base64')
            : att.content,
          type: att.type || 'application/pdf'
        }))
      });

      logger.info('Email sent successfully', { 
        to: data.to, 
        subject: data.subject,
        messageId: result.data?.id 
      });

      return { 
        success: true, 
        messageId: result.data?.id 
      };
    } catch (error) {
      logger.error('Failed to send email', error as Error, { to: data.to, subject: data.subject });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendWithDelay(
    data: EmailData, 
    delayMs: number
  ): Promise<{ success: boolean; scheduled?: boolean }> {
    if (delayMs <= 0) {
      return await this.sendEmail(data);
    }

    // For Vercel serverless, we'll use a simple delay
    // In production, you'd want a proper job queue (like Bull, BullMQ, or a service like Inngest)
    setTimeout(async () => {
      await this.sendEmail(data);
    }, delayMs);

    logger.info('Email scheduled', { 
      to: data.to, 
      subject: data.subject,
      delayMs 
    });

    return { success: true, scheduled: true };
  }
}

export const emailService = new EmailService();


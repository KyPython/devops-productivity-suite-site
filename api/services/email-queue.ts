import { emailService } from './email-service';
import { logger } from '../utils/logger';
import {
  getWelcomeEmail,
  getPainPointEmail,
  getROIEmail,
  getSocialProofEmail,
  getFinalPushEmail,
  getChecklistEmail
} from '../templates/email-templates';
import * as fs from 'fs';
import * as path from 'path';
import { VercelRequest } from '@vercel/node';

export interface EmailSchedule {
  email: string;
  firstname: string;
  sequenceStartDate: Date;
}

/**
 * Email queue service that schedules emails with delays
 * For production, consider using a proper job queue like BullMQ or Inngest
 */
export class EmailQueueService {
  /**
   * Schedule the complete email sequence for a contact
   */
  async scheduleEmailSequence(email: string, firstname: string): Promise<void> {
    const sequenceStartDate = new Date();
    
    logger.info('Scheduling email sequence', { email, firstname });

    // Email 0: Checklist PDF (immediate)
    await this.scheduleChecklistEmail(email, firstname);

    // Email 1: Welcome (immediate)
    await this.scheduleEmail(email, firstname, getWelcomeEmail, 0, sequenceStartDate);

    // Email 2: Pain Point (Day 3 = 2 days after welcome)
    await this.scheduleEmail(email, firstname, getPainPointEmail, 2 * 24 * 60 * 60 * 1000, sequenceStartDate);

    // Email 3: ROI (Day 6 = 5 days after welcome)
    await this.scheduleEmail(email, firstname, getROIEmail, 5 * 24 * 60 * 60 * 1000, sequenceStartDate);

    // Email 4: Social Proof (Day 10 = 9 days after welcome)
    await this.scheduleEmail(email, firstname, getSocialProofEmail, 9 * 24 * 60 * 60 * 1000, sequenceStartDate);

    // Email 5: Final Push (Day 14 = 13 days after welcome)
    await this.scheduleEmail(email, firstname, getFinalPushEmail, 13 * 24 * 60 * 60 * 1000, sequenceStartDate);

    logger.info('Email sequence scheduled', { email, sequenceStartDate });
  }

  private async scheduleEmail(
    email: string,
    firstname: string,
    templateFn: (name: string) => { subject: string; html: string },
    delayMs: number,
    sequenceStartDate: Date
  ): Promise<void> {
    const template = templateFn(firstname);
    
    // For Vercel serverless, we'll store scheduled emails and use a cron job or webhook
    // For now, we'll use setTimeout (works for short delays, but not ideal for days)
    
    if (delayMs === 0) {
      // Send immediately
      await emailService.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html
      });
    } else {
      // For longer delays, we need a proper scheduler
      // This is a simplified version - in production use a job queue
      logger.info('Email scheduled for future', { 
        email, 
        delayMs, 
        scheduledFor: new Date(Date.now() + delayMs) 
      });
      
      // Store in a queue/database for processing by a cron job
      // For now, we'll log it - you'll need to set up a cron job to process these
      await this.storeScheduledEmail(email, template.subject, template.html, delayMs);
    }
  }

  private async scheduleChecklistEmail(email: string, firstname: string): Promise<void> {
    const template = getChecklistEmail(firstname);
    
    // Try to load PDF - in Vercel, files are in the deployment
    let attachments;
    try {
      const pdfPath = path.join(process.cwd(), 'BUSINESS_MATERIALS', 'MARKETING', 'DevOps_Automation_Checklist.pdf');
      if (fs.existsSync(pdfPath)) {
        const pdfBuffer = fs.readFileSync(pdfPath);
        attachments = [{
          filename: 'DevOps_Automation_Checklist.pdf',
          content: pdfBuffer,
          type: 'application/pdf'
        }];
      } else {
        logger.warn('PDF not found at expected path, sending email without attachment', { pdfPath });
      }
    } catch (error) {
      logger.warn('Failed to load PDF, sending email without attachment', { error });
    }

    await emailService.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      attachments
    });
  }

  /**
   * Store scheduled email for later processing
   * In production, use a database or job queue
   */
  private async storeScheduledEmail(
    email: string,
    subject: string,
    html: string,
    delayMs: number
  ): Promise<void> {
    // This is a placeholder - in production, store in a database
    // For Vercel, consider using:
    // - Inngest (serverless job queue)
    // - Vercel Cron Jobs + database
    // - External service like Zapier/Make.com
    
    const scheduledFor = new Date(Date.now() + delayMs);
    
    logger.info('Storing scheduled email', {
      email,
      subject,
      scheduledFor: scheduledFor.toISOString()
    });

    // TODO: Store in database or job queue
    // For now, we'll need to set up a cron job to process these
  }
}

export const emailQueueService = new EmailQueueService();


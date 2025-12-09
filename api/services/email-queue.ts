import { emailService } from './email-service';
import { logger } from '../utils/logger';
import {
  getWelcomeEmail,
  getPainPointEmail,
  getROIEmail,
  getSocialProofEmail,
  getFinalPushEmail,
  getFollowUpEmail,
  getChecklistEmail
} from '../templates/email-templates';
import * as fs from 'fs';
import * as path from 'path';
import { VercelRequest } from '@vercel/node';
import { scheduledEmailStorage } from './scheduled-email-storage';

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

    // Email 6: Follow-up (Day 21 = 20 days after welcome, 7 days after final push)
    await this.scheduleEmail(email, firstname, getFollowUpEmail, 20 * 24 * 60 * 60 * 1000, sequenceStartDate);

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
      
      // Store in queue for processing by cron job
      const scheduledFor = new Date(Date.now() + delayMs);
      await scheduledEmailStorage.addScheduledEmail(
        email,
        firstname,
        template.subject,
        template.html,
        scheduledFor
      );
    }
  }

  private async scheduleChecklistEmail(email: string, firstname: string): Promise<void> {
    const template = getChecklistEmail(firstname);
    
    // Try to load PDF - check multiple possible locations
    let attachments;
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'DevOps_Automation_Checklist.pdf'), // Vercel deployment
      path.join(process.cwd(), 'BUSINESS_MATERIALS', 'MARKETING', 'DevOps_Automation_Checklist.pdf'), // Local dev
      path.join(__dirname, '../../public/DevOps_Automation_Checklist.pdf'), // Alternative path
    ];
    
    let pdfBuffer: Buffer | null = null;
    for (const pdfPath of possiblePaths) {
      try {
        if (fs.existsSync(pdfPath)) {
          pdfBuffer = fs.readFileSync(pdfPath);
          logger.info('PDF found and loaded', { pdfPath });
          break;
        }
      } catch (error) {
        logger.warn('Failed to load PDF from path', { pdfPath, error });
      }
    }
    
    if (pdfBuffer) {
      attachments = [{
        filename: 'DevOps_Automation_Checklist.pdf',
        content: pdfBuffer,
        type: 'application/pdf'
      }];
      logger.info('PDF attachment prepared', { size: pdfBuffer.length });
    } else {
      logger.warn('PDF not found in any expected location, sending email without attachment', { 
        checkedPaths: possiblePaths 
      });
    }

    await emailService.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      attachments
    });
  }

}

export const emailQueueService = new EmailQueueService();


import { clientStorage, Client } from './client-storage';
import { documentGenerator, InvoiceData, MonthlyCheckinData, SupportTicketData } from './document-generator';
import { emailService } from './email-service';
import { logger } from '../utils/logger';

export interface WorkflowTask {
  id: string;
  type: 'invoice' | 'checkin' | 'onboarding-reminder' | 'support-followup';
  clientId: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'failed';
  data?: any;
  createdAt: string;
  completedAt?: string;
}

export class WorkflowAutomation {
  /**
   * Generate and send monthly invoice
   */
  async generateMonthlyInvoice(clientId: string, monthYear?: string): Promise<string> {
    const client = await clientStorage.getClientById(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const invoiceNumber = `INV-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const invoiceData: InvoiceData = {
      invoiceNumber,
      date,
      dueDate,
      client,
      monthlyFee: client.monthlyFee,
      monthYear: monthYear || `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
      paymentTerms: ['Payment due within 30 days'],
      paymentMethods: ['Bank transfer', 'Credit card', 'PayPal'],
    };

    const invoiceContent = documentGenerator.generateInvoice(invoiceData);
    
    logger.info('Monthly invoice generated', { clientId, invoiceNumber });
    return invoiceContent;
  }

  /**
   * Schedule monthly check-in reminder
   */
  async scheduleMonthlyCheckin(clientId: string, month: string, year: string): Promise<void> {
    const client = await clientStorage.getClientById(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    // Add check-in to client record
    const checkin = {
      month,
      year,
      date: new Date().toISOString().split('T')[0],
      notes: 'Scheduled',
    };

    const existingCheckins = client.monthlyCheckins || [];
    existingCheckins.push(checkin);

    await clientStorage.updateClient(clientId, {
      monthlyCheckins: existingCheckins,
    });

    logger.info('Monthly check-in scheduled', { clientId, month, year });
  }

  /**
   * Generate monthly check-in document
   */
  async generateMonthlyCheckin(clientId: string, month: string, year: string, data?: Partial<MonthlyCheckinData>): Promise<string> {
    const client = await clientStorage.getClientById(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const checkinData: MonthlyCheckinData = {
      client,
      month,
      year,
      date: new Date().toISOString().split('T')[0],
      ...data,
    };

    const checkinContent = documentGenerator.generateMonthlyCheckin(checkinData);
    
    logger.info('Monthly check-in generated', { clientId, month, year });
    return checkinContent;
  }

  /**
   * Create support ticket
   */
  async createSupportTicket(clientId: string, ticketData: Omit<SupportTicketData, 'ticketNumber' | 'client' | 'date'>): Promise<string> {
    const client = await clientStorage.getClientById(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const ticketNumber = `TKT-${Date.now()}`;
    const fullTicketData: SupportTicketData = {
      ...ticketData,
      ticketNumber,
      client,
      date: new Date().toISOString().split('T')[0],
    };

    const ticketContent = documentGenerator.generateSupportTicket(fullTicketData);

    // Add to support history
    const supportEntry = {
      date: fullTicketData.date,
      issue: ticketData.issueDescription,
      resolution: ticketData.resolution || 'Pending',
    };

    const existingHistory = client.supportHistory || [];
    existingHistory.push(supportEntry);

    await clientStorage.updateClient(clientId, {
      supportHistory: existingHistory,
    });

    logger.info('Support ticket created', { clientId, ticketNumber });
    return ticketContent;
  }

  /**
   * Send onboarding reminder email
   */
  async sendOnboardingReminder(clientId: string, reminderType: 'week1' | 'week2' | 'week3'): Promise<void> {
    const client = await clientStorage.getClientById(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const reminders = {
      week1: {
        subject: 'Week 1 Onboarding Reminder - DevOps Productivity Suite',
        message: `Hi ${client.contact.name},\n\nThis is a reminder that Week 1 of your onboarding is in progress. Please ensure all discovery and configuration tasks are completed.\n\nBest regards,\nDevOps Productivity Suite`,
      },
      week2: {
        subject: 'Week 2 Onboarding Reminder - Setup & Integration',
        message: `Hi ${client.contact.name},\n\nWeek 2 of your onboarding focuses on setup and integration. Please ensure all tools are installed and tested.\n\nBest regards,\nDevOps Productivity Suite`,
      },
      week3: {
        subject: 'Week 3 Onboarding Reminder - Training & Handoff',
        message: `Hi ${client.contact.name},\n\nWeek 3 is your final onboarding week focusing on training and handoff. Please ensure training sessions are scheduled.\n\nBest regards,\nDevOps Productivity Suite`,
      },
    };

    const reminder = reminders[reminderType];
    
    await emailService.sendEmail({
      to: client.contact.email,
      subject: reminder.subject,
      html: `<p>${reminder.message.replace(/\n/g, '<br>')}</p>`,
    });

    logger.info('Onboarding reminder sent', { clientId, reminderType });
  }

  /**
   * Check for clients needing monthly check-ins
   */
  async checkForDueCheckins(): Promise<Client[]> {
    const clients = await clientStorage.getClientsByStatus('active');
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear().toString();

    return clients.filter(client => {
      if (!client.monthlyCheckins || client.monthlyCheckins.length === 0) {
        return true; // Never had a check-in
      }

      const lastCheckin = client.monthlyCheckins[client.monthlyCheckins.length - 1];
      const lastCheckinDate = new Date(lastCheckin.date);
      const monthsSinceLastCheckin = 
        (now.getFullYear() - lastCheckinDate.getFullYear()) * 12 + 
        (now.getMonth() - lastCheckinDate.getMonth());

      return monthsSinceLastCheckin >= 1; // Due if last check-in was 1+ months ago
    });
  }

  /**
   * Check for clients needing onboarding reminders
   */
  async checkForOnboardingReminders(): Promise<Array<{ client: Client; reminderType: 'week1' | 'week2' | 'week3' }>> {
    const clients = await clientStorage.getClientsByStatus('onboarding');
    const reminders: Array<{ client: Client; reminderType: 'week1' | 'week2' | 'week3' }> = [];

    for (const client of clients) {
      if (!client.startDate) continue;

      const startDate = new Date(client.startDate);
      const now = new Date();
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceStart >= 0 && daysSinceStart < 7 && !client.onboardingProgress?.['week1_reminder_sent']) {
        reminders.push({ client, reminderType: 'week1' });
      } else if (daysSinceStart >= 7 && daysSinceStart < 14 && !client.onboardingProgress?.['week2_reminder_sent']) {
        reminders.push({ client, reminderType: 'week2' });
      } else if (daysSinceStart >= 14 && daysSinceStart < 21 && !client.onboardingProgress?.['week3_reminder_sent']) {
        reminders.push({ client, reminderType: 'week3' });
      }
    }

    return reminders;
  }

  /**
   * Update onboarding progress
   */
  async updateOnboardingProgress(clientId: string, taskKey: string, completed: boolean): Promise<void> {
    const client = await clientStorage.getClientById(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const progress = client.onboardingProgress || {};
    progress[taskKey] = completed;

    await clientStorage.updateClient(clientId, {
      onboardingProgress: progress,
    });

    logger.info('Onboarding progress updated', { clientId, taskKey, completed });
  }
}

export const workflowAutomation = new WorkflowAutomation();


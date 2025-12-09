import { promises as fs } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';

export interface ScheduledEmail {
  id: string;
  email: string;
  firstname: string;
  subject: string;
  html: string;
  scheduledFor: string; // ISO date string
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

const DATA_DIR = join(process.cwd(), '.data');
const SCHEDULED_EMAILS_FILE = join(DATA_DIR, 'scheduled-emails.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    logger.error('Failed to create data directory', error as Error);
  }
}

async function loadScheduledEmails(): Promise<ScheduledEmail[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SCHEDULED_EMAILS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    logger.error('Failed to load scheduled emails', error as Error);
    return [];
  }
}

async function saveScheduledEmails(emails: ScheduledEmail[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(SCHEDULED_EMAILS_FILE, JSON.stringify(emails, null, 2), 'utf-8');
  } catch (error) {
    logger.error('Failed to save scheduled emails', error as Error);
    throw error;
  }
}

export class ScheduledEmailStorage {
  async addScheduledEmail(
    email: string,
    firstname: string,
    subject: string,
    html: string,
    scheduledFor: Date
  ): Promise<ScheduledEmail> {
    const emails = await loadScheduledEmails();
    const newEmail: ScheduledEmail = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      firstname,
      subject,
      html,
      scheduledFor: scheduledFor.toISOString(),
      sent: false,
      createdAt: new Date().toISOString(),
    };
    emails.push(newEmail);
    await saveScheduledEmails(emails);
    logger.info('Scheduled email added', { 
      id: newEmail.id, 
      email, 
      scheduledFor: newEmail.scheduledFor 
    });
    return newEmail;
  }

  async getDueEmails(): Promise<ScheduledEmail[]> {
    const emails = await loadScheduledEmails();
    const now = new Date();
    return emails.filter(
      (e) => !e.sent && new Date(e.scheduledFor) <= now
    );
  }

  async markAsSent(id: string): Promise<void> {
    const emails = await loadScheduledEmails();
    const email = emails.find((e) => e.id === id);
    if (email) {
      email.sent = true;
      email.sentAt = new Date().toISOString();
      await saveScheduledEmails(emails);
      logger.info('Scheduled email marked as sent', { id });
    }
  }

  async getAllScheduledEmails(): Promise<ScheduledEmail[]> {
    return await loadScheduledEmails();
  }

  async deleteScheduledEmail(id: string): Promise<boolean> {
    const emails = await loadScheduledEmails();
    const filtered = emails.filter((e) => e.id !== id);
    if (filtered.length === emails.length) {
      return false;
    }
    await saveScheduledEmails(filtered);
    logger.info('Scheduled email deleted', { id });
    return true;
  }
}

export const scheduledEmailStorage = new ScheduledEmailStorage();


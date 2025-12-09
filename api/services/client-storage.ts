import { promises as fs } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';

export interface Client {
  id: string;
  company: string;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  startDate: string;
  status: 'active' | 'onboarding' | 'paused' | 'cancelled';
  monthlyFee: number;
  teamSize?: number;
  techStack?: string[];
  repository?: string;
  setupTimeline?: Array<{
    week: number;
    date: string;
    status: string;
  }>;
  supportHistory?: Array<{
    date: string;
    issue: string;
    resolution: string;
  }>;
  monthlyCheckins?: Array<{
    month: string;
    year: string;
    notes: string;
    date: string;
  }>;
  onboardingProgress?: {
    [key: string]: boolean;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = join(process.cwd(), '.data');
const CLIENTS_FILE = join(DATA_DIR, 'clients.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    logger.error('Failed to create data directory', error as Error);
  }
}

async function loadClients(): Promise<Client[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CLIENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    logger.error('Failed to load clients', error as Error);
    return [];
  }
}

async function saveClients(clients: Client[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
  } catch (error) {
    logger.error('Failed to save clients', error as Error);
    throw error;
  }
}

export class ClientStorage {
  async getAllClients(): Promise<Client[]> {
    return await loadClients();
  }

  async getClientById(id: string): Promise<Client | null> {
    const clients = await loadClients();
    return clients.find(c => c.id === id) || null;
  }

  async getClientByEmail(email: string): Promise<Client | null> {
    const clients = await loadClients();
    return clients.find(c => c.contact.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const clients = await loadClients();
    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clients.push(newClient);
    await saveClients(clients);
    logger.info('Client created', { clientId: newClient.id, company: newClient.company });
    return newClient;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const clients = await loadClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      return null;
    }
    clients[index] = {
      ...clients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveClients(clients);
    logger.info('Client updated', { clientId: id });
    return clients[index];
  }

  async deleteClient(id: string): Promise<boolean> {
    const clients = await loadClients();
    const filtered = clients.filter(c => c.id !== id);
    if (filtered.length === clients.length) {
      return false;
    }
    await saveClients(filtered);
    logger.info('Client deleted', { clientId: id });
    return true;
  }

  async getClientsByStatus(status: Client['status']): Promise<Client[]> {
    const clients = await loadClients();
    return clients.filter(c => c.status === status);
  }
}

export const clientStorage = new ClientStorage();


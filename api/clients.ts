import { VercelRequest, VercelResponse } from '@vercel/node';
import { withMonitoring } from './utils/middleware';
import { logger } from './utils/logger';
import { AppError, ErrorCode } from './utils/error-handler';
import { clientStorage } from './services/client-storage';
import { validateString, validateRequired, validateEmail } from './utils/validator';

/**
 * Client Management API
 * GET /api/clients - List all clients
 * GET /api/clients?id=xxx - Get specific client
 * POST /api/clients - Create new client
 * PUT /api/clients?id=xxx - Update client
 * DELETE /api/clients?id=xxx - Delete client
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { id, email, status } = req.query;

    // GET - List or retrieve clients
    if (req.method === 'GET') {
      if (id && typeof id === 'string') {
        const client = await clientStorage.getClientById(id);
        if (!client) {
          throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
        }
        res.status(200).json({ success: true, data: client });
      }

      if (email && typeof email === 'string') {
        const client = await clientStorage.getClientByEmail(email);
        if (!client) {
          throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
        }
        res.status(200).json({ success: true, data: client });
      }

      if (status && typeof status === 'string') {
        const clients = await clientStorage.getClientsByStatus(status as any);
        res.status(200).json({ success: true, data: clients });
      }

      const clients = await clientStorage.getAllClients();
      return res.status(200).json({ success: true, data: clients });
    }

    // POST - Create new client
    if (req.method === 'POST') {
      const body = req.body || {};
      
      const company = validateString(
        validateRequired(body.company, 'company'),
        'company',
        { minLength: 1, maxLength: 200 }
      );

      const contactName = validateString(
        validateRequired(body.contactName, 'contactName'),
        'contactName',
        { minLength: 1, maxLength: 100 }
      );

      const contactEmail = validateEmail(
        validateRequired(body.contactEmail, 'contactEmail')
      );

      const contactPhone = body.contactPhone 
        ? validateString(body.contactPhone, 'contactPhone', { maxLength: 20 })
        : undefined;

      const monthlyFee = body.monthlyFee ? Number(body.monthlyFee) : 297;
      const startDate = body.startDate || new Date().toISOString().split('T')[0];
      const status = body.status || 'onboarding';

      const client = await clientStorage.createClient({
        company,
        contact: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
        },
        startDate,
        status: status as any,
        monthlyFee,
        teamSize: body.teamSize ? Number(body.teamSize) : undefined,
        techStack: Array.isArray(body.techStack) ? body.techStack : undefined,
        repository: body.repository,
      });

      logger.info('Client created via API', { clientId: client.id, company: client.company });
      res.status(201).json({ success: true, data: client });
    }

    // PUT - Update client
    if (req.method === 'PUT') {
      const clientId = validateString(
        validateRequired(req.query.id as string, 'id'),
        'id'
      );

      const body = req.body || {};
      const updates: any = {};
      const client = await clientStorage.getClientById(clientId);
      if (!client) {
        throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
      }

      if (body.company) updates.company = validateString(body.company, 'company', { minLength: 1 });
      
      // Handle contact updates properly
      if (body.contactName || body.contactEmail || body.contactPhone) {
        updates.contact = {
          ...client.contact,
          ...(body.contactName && { name: validateString(body.contactName, 'contactName') }),
          ...(body.contactEmail && { email: validateEmail(body.contactEmail) }),
          ...(body.contactPhone && { phone: validateString(body.contactPhone, 'contactPhone') }),
        };
      }
      
      if (body.status) updates.status = body.status;
      if (body.monthlyFee) updates.monthlyFee = Number(body.monthlyFee);
      if (body.teamSize !== undefined) updates.teamSize = Number(body.teamSize);
      if (body.techStack) updates.techStack = Array.isArray(body.techStack) ? body.techStack : undefined;
      if (body.repository) updates.repository = body.repository;
      if (body.notes) updates.notes = body.notes;

      const updated = await clientStorage.updateClient(clientId, updates);
      if (!updated) {
        throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
      }

      logger.info('Client updated via API', { clientId });
      res.status(200).json({ success: true, data: updated });
    }

    // DELETE - Delete client
    if (req.method === 'DELETE') {
      const clientId = validateString(
        validateRequired(req.query.id as string, 'id'),
        'id'
      );

      const deleted = await clientStorage.deleteClient(clientId);
      if (!deleted) {
        throw new AppError(ErrorCode.NOT_FOUND, 'Client not found', 404);
      }

      logger.info('Client deleted via API', { clientId });
      res.status(200).json({ success: true, message: 'Client deleted' });
    }

    throw new AppError(ErrorCode.NOT_FOUND, 'Method not allowed', 405);
  } catch (error) {
    logger.error('Client API error', error as Error, { body: req.body, query: req.query });
    throw error;
  }
});


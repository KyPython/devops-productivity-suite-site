import { VercelRequest, VercelResponse } from '@vercel/node';
import { withMonitoring } from './utils/middleware';
import { logger } from './utils/logger';
import { validateString, validateRequired } from './utils/validator';
import { AppError, ErrorCode } from './utils/error-handler';
import { emailQueueService } from './services/email-queue';

/**
 * Lead capture endpoint that submits to HubSpot and sends email
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    throw new AppError(ErrorCode.NOT_FOUND, 'Method not allowed', 405);
  }

  try {
    const body = req.body || {};
    
    // Validate input
    const email = validateString(
      validateRequired(body.email, 'email'),
      'email',
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    );
    const firstname = validateString(
      validateRequired(body.firstname, 'firstname'),
      'firstname',
      { minLength: 1, maxLength: 100 }
    );

    logger.info('Lead capture request', { email, firstname });

    // Submit to HubSpot (if configured)
    let hubspotResult;
    try {
      hubspotResult = await submitToHubSpot(email, firstname);
      logger.info('HubSpot contact created', { email, hubspotContactId: hubspotResult.contactId });
    } catch (error) {
      logger.warn('HubSpot submission failed, continuing with email sequence', { error });
      hubspotResult = { contactId: 'hubspot-unavailable' };
    }
    
    // Start email sequence (works independently of HubSpot)
    try {
      await emailQueueService.scheduleEmailSequence(email, firstname);
      logger.info('Email sequence scheduled', { email });
    } catch (error) {
      logger.error('Failed to schedule email sequence', error as Error, { email });
      // Don't fail the request if email scheduling fails
    }

    logger.info('Lead captured successfully', { email, hubspotContactId: hubspotResult.contactId });

    res.status(200).json({
      success: true,
      message: 'Thank you! Check your email for the DevOps Automation Checklist.',
      contactId: hubspotResult.contactId,
      email: email
    });
  } catch (error) {
    logger.error('Lead capture failed', error as Error, { body: req.body });
    throw error;
  }
});

async function submitToHubSpot(email: string, firstname: string): Promise<{ contactId: string }> {
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  const hubspotPortalId = process.env.HUBSPOT_PORTAL_ID;

  if (!hubspotApiKey) {
    logger.warn('HubSpot API key not configured, skipping HubSpot submission');
    // In development, we can still return success
    if (process.env.NODE_ENV === 'development') {
      return { contactId: 'dev-mode' };
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      'Lead capture service not configured',
      500
    );
  }

  try {
    // HubSpot API endpoint for creating/updating contacts
    const hubspotUrl = `https://api.hubapi.com/crm/v3/objects/contacts`;
    
    const contactData = {
      properties: {
        email: email,
        firstname: firstname,
        // Trigger email sequence workflow
        'devops_checklist_downloaded': 'true',
        'lead_source': 'landing_page',
        'email_sequence_started': 'true',
        'email_sequence_date': new Date().toISOString()
      }
    };

    const response = await fetch(hubspotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hubspotApiKey}`
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('HubSpot API error', new Error(errorText), {
        status: response.status,
        statusText: response.statusText
      });
      
      // If contact already exists (409), try to update instead
      if (response.status === 409) {
        return await updateHubSpotContact(email, firstname, hubspotApiKey);
      }
      
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to submit to HubSpot',
        500
      );
    }

    const result = await response.json();
    return { contactId: result.id || 'unknown' };
  } catch (error) {
    logger.error('HubSpot submission error', error as Error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to process lead capture',
      500
    );
  }
}

async function updateHubSpotContact(
  email: string,
  firstname: string,
  apiKey: string
): Promise<{ contactId: string }> {
  try {
    // First, find the contact by email
    const searchUrl = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }]
      })
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search for contact');
    }

    const searchResult = await searchResponse.json();
    const contactId = searchResult.results?.[0]?.id;

    if (!contactId) {
      throw new Error('Contact not found');
    }

    // Update the contact
    const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        properties: {
          firstname: firstname,
          // Trigger email sequence if not already started
          'devops_checklist_downloaded': 'true',
          'lead_source': 'landing_page',
          'email_sequence_started': 'true',
          'email_sequence_date': new Date().toISOString()
        }
      })
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update contact');
    }

    return { contactId };
  } catch (error) {
    logger.error('HubSpot update error', error as Error);
    throw error;
  }
}


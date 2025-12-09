import { VercelRequest, VercelResponse } from '@vercel/node';
import { withMonitoring } from '../utils/middleware';
import { logger } from '../utils/logger';
import { emailQueueService } from '../services/email-queue';
import { validateString, validateRequired } from '../utils/validator';

/**
 * Webhook endpoint for HubSpot form submissions
 * Configure this URL in HubSpot: Settings > Integrations > Private Apps > Webhooks
 * 
 * HubSpot will POST to this endpoint when a form is submitted
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    
    // HubSpot form submission webhook format
    // See: https://developers.hubspot.com/docs/api/webhooks/webhooks-overview
    const submissionData = body.submissionData || body;
    
    // Extract email and firstname from HubSpot form fields
    // HubSpot sends field values in different formats depending on setup
    let email: string | undefined;
    let firstname: string | undefined;

    // Try different HubSpot webhook formats
    if (submissionData.email) {
      email = submissionData.email;
    } else if (submissionData.fields) {
      // HubSpot form webhook format with fields array
      const emailField = submissionData.fields.find((f: { name?: string; value?: string }) => 
        f.name === 'email' || f.name === 'Email'
      );
      const firstnameField = submissionData.fields.find((f: { name?: string; value?: string }) => 
        f.name === 'firstname' || f.name === 'firstName' || f.name === 'First Name'
      );
      
      email = emailField?.value;
      firstname = firstnameField?.value;
    } else if (body.properties) {
      // HubSpot contact webhook format
      email = body.properties.email;
      firstname = body.properties.firstname || body.properties.firstName;
    }

    if (!email) {
      logger.warn('HubSpot webhook missing email', { body });
      return res.status(400).json({ error: 'Missing email in webhook payload' });
    }

    // Validate email
    const validatedEmail = validateString(
      validateRequired(email, 'email'),
      'email',
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    );
    
    const validatedFirstname = firstname 
      ? validateString(firstname, 'firstname', { minLength: 1, maxLength: 100 })
      : 'Friend'; // Default if not provided

    logger.info('HubSpot form submission received', { 
      email: validatedEmail, 
      firstname: validatedFirstname 
    });

    // Start email sequence
    try {
      await emailQueueService.scheduleEmailSequence(validatedEmail, validatedFirstname);
      logger.info('Email sequence started from HubSpot webhook', { email: validatedEmail });
    } catch (error) {
      logger.error('Failed to start email sequence from webhook', error as Error, { 
        email: validatedEmail 
      });
      // Don't fail the webhook - HubSpot has already captured the lead
    }

    // Return success to HubSpot
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      email: validatedEmail
    });
  } catch (error) {
    logger.error('HubSpot webhook error', error as Error, { body: req.body });
    // Return 200 to HubSpot even on error (so HubSpot doesn't retry)
    // Log the error for debugging
    res.status(200).json({ 
      success: false, 
      error: 'Webhook processing failed but lead captured in HubSpot' 
    });
  }
});

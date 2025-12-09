import { logger } from '../utils/logger';

/**
 * Service for interacting with HubSpot API
 */
export class HubSpotService {
  private apiKey: string | undefined;
  
  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY;
  }

  /**
   * Check if a contact has replied to emails or shown engagement
   * Returns true if contact has replied, false otherwise
   */
  async hasContactReplied(email: string): Promise<boolean> {
    if (!this.apiKey) {
      logger.warn('HubSpot API key not configured, skipping reply check');
      return false;
    }

    try {
      // First, find the contact by email
      const searchUrl = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
      const searchResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: email
            }]
          }],
          properties: ['email', 'firstname', 'hs_email_replied', 'hs_last_contacted_date', 'hs_email_optout']
        })
      });

      if (!searchResponse.ok) {
        logger.warn('Failed to search HubSpot contact', { email, status: searchResponse.status });
        return false;
      }

      const searchResult = await searchResponse.json() as {
        results?: Array<{
          id: string;
          properties?: {
            hs_email_replied?: string;
            hs_last_contacted_date?: string;
            hs_email_optout?: string;
          };
        }>;
      };

      const contact = searchResult.results?.[0];
      if (!contact) {
        logger.info('Contact not found in HubSpot', { email });
        return false;
      }

      const props = contact.properties || {};
      
      // Check if contact has replied to emails
      const hasReplied = props.hs_email_replied === 'true' || props.hs_email_replied === '1';
      
      // Check if contact has opted out
      const hasOptedOut = props.hs_email_optout === 'true' || props.hs_email_optout === '1';
      
      // Check if contact was recently contacted (within last 7 days) - might indicate engagement
      const lastContacted = props.hs_last_contacted_date;
      const recentlyContacted = lastContacted 
        ? (Date.now() - new Date(lastContacted).getTime()) < 7 * 24 * 60 * 60 * 1000
        : false;

      if (hasReplied || hasOptedOut) {
        logger.info('Contact has replied or opted out', { 
          email, 
          hasReplied, 
          hasOptedOut,
          contactId: contact.id 
        });
        return true;
      }

      // Also check for engagement via email engagement API
      // This checks if there have been recent email opens/clicks/replies
      try {
        const engagementUrl = `https://api.hubapi.com/email/public/v1/emails/${contact.id}/engagement`;
        const engagementResponse = await fetch(engagementUrl, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        });

        if (engagementResponse.ok) {
          const engagementData = await engagementResponse.json() as {
            replied?: boolean;
            clicked?: boolean;
            opened?: boolean;
          };

          if (engagementData.replied) {
            logger.info('Contact has replied (via engagement API)', { email, contactId: contact.id });
            return true;
          }
        }
      } catch (error) {
        // Engagement API might not be available, that's okay
        logger.debug('Could not check email engagement', { email, error });
      }

      return false;
    } catch (error) {
      logger.error('Error checking HubSpot contact reply status', error as Error, { email });
      // On error, assume no reply (safer to send than to miss)
      return false;
    }
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<{ id: string; properties?: Record<string, unknown> } | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const searchUrl = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
      const searchResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
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
        return null;
      }

      const searchResult = await searchResponse.json() as {
        results?: Array<{ id: string; properties?: Record<string, unknown> }>;
      };

      return searchResult.results?.[0] || null;
    } catch (error) {
      logger.error('Error getting HubSpot contact', error as Error, { email });
      return null;
    }
  }
}

export const hubspotService = new HubSpotService();

import { Client } from './client-storage';
import { logger } from '../utils/logger';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: Client;
  setupFee?: number;
  monthlyFee?: number;
  monthYear?: string;
  paymentTerms?: string[];
  paymentMethods?: string[];
}

export interface SupportTicketData {
  ticketNumber: string;
  client: Client;
  date: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  issueDescription: string;
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: {
    tool?: string;
    techStack?: string;
    errorMessages?: string;
  };
  resolution?: string;
  resolutionDate?: string;
  followUp?: string;
}

export interface MonthlyCheckinData {
  client: Client;
  month: string;
  year: string;
  date: string;
  attendees?: string[];
  toolUsageReview?: {
    mostUsed?: string[];
    notUsed?: string[];
    issues?: string[];
  };
  updates?: string[];
  supportIssues?: string[];
  teamChanges?: string[];
  nextSteps?: Array<{
    item: string;
    assignedTo?: string;
    dueDate?: string;
  }>;
  notes?: string;
  actionItems?: Array<{
    item: string;
    assignedTo?: string;
    dueDate?: string;
  }>;
  satisfaction?: 'very-satisfied' | 'satisfied' | 'neutral' | 'dissatisfied';
  renewalDiscussion?: string;
}

export class DocumentGenerator {
  generateClientTracking(client: Client): string {
    const timeline = client.setupTimeline?.map(t => 
      `- **Week ${t.week}:** ${t.date} - ${t.status}`
    ).join('\n') || '- No timeline data';

    const supportHistory = client.supportHistory?.map(s => 
      `- ${s.date} - ${s.issue}/${s.resolution}`
    ).join('\n') || '- No support history';

    const checkins = client.monthlyCheckins?.map(c => 
      `- ${c.month}/${c.year} - ${c.notes}`
    ).join('\n') || '- No check-ins yet';

    return `# Client Tracking Template

## Client Information
**Company:** ${client.company}  
**Contact:** ${client.contact.name}, ${client.contact.email}${client.contact.phone ? `, ${client.contact.phone}` : ''}  
**Start Date:** ${client.startDate}  
**Status:** ${client.status.charAt(0).toUpperCase() + client.status.slice(1)}  
**Monthly Fee:** $${client.monthlyFee}

## Team Details
**Team Size:** ${client.teamSize || 'N/A'}  
**Tech Stack:** ${client.techStack?.join(', ') || 'N/A'}  
**Repository:** ${client.repository || 'N/A'}

## Setup Timeline
${timeline}
- **Completed:** ${client.setupTimeline?.find(t => t.status === 'completed')?.date || 'In progress'}

## Support History
${supportHistory}

## Monthly Check-ins
${checkins}

## Notes
${client.notes || 'No notes'}

`;
  }

  generateInvoice(data: InvoiceData): string {
    const totalAmount = (data.setupFee || 0) + (data.monthlyFee || 0);
    const dueDate = data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return `# Invoice #${data.invoiceNumber}

**Date:** ${data.date}  
**Due Date:** ${dueDate}

**Bill To:**
${data.client.company}
${data.client.contact.email}

**From:**
DevOps Productivity Suite
${process.env.FROM_EMAIL || 'noreply@devopsproductivitysuite.com'}

---

## Services

${data.setupFee ? `### One-Time Setup Fee
DevOps Productivity Suite - Setup and Configuration
**Amount:** $${data.setupFee.toFixed(2)}

` : ''}${data.monthlyFee ? `### Monthly Support${data.monthYear ? ` (${data.monthYear})` : ''}
DevOps Productivity Suite - Monthly Support${data.monthYear ? ` (${data.monthYear})` : ''}
**Amount:** $${data.monthlyFee.toFixed(2)}

` : ''}---

## Payment Terms
${data.paymentTerms?.map(term => `- ${term}`).join('\n') || '- Payment due within 30 days'}
${data.paymentMethods?.length ? `- Payment methods: ${data.paymentMethods.join(', ')}` : ''}

## Total Due
**$${totalAmount.toFixed(2)}**

---

Thank you for your business!

`;
  }

  generateSupportTicket(data: SupportTicketData): string {
    const steps = data.stepsToReproduce?.map((step, i) => `${i + 1}. ${step}`).join('\n') || 'N/A';
    const environment = data.environment ? `
- Tool: ${data.environment.tool || 'N/A'}
- Tech Stack: ${data.environment.techStack || 'N/A'}
- Error Messages: ${data.environment.errorMessages || 'None'}
` : '';

    return `# Support Ticket #${data.ticketNumber}

**Client:** ${data.client.company}  
**Date:** ${data.date}  
**Status:** ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}  
**Priority:** ${data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}

## Issue Description
${data.issueDescription}

## Steps to Reproduce
${steps}

## Expected Behavior
${data.expectedBehavior || 'N/A'}

## Actual Behavior
${data.actualBehavior || 'N/A'}

## Environment
${environment}

## Resolution
${data.resolution || 'Pending'}

## Resolution Date
${data.resolutionDate || 'N/A'}

## Follow-up
${data.followUp || 'None'}

`;
  }

  generateMonthlyCheckin(data: MonthlyCheckinData): string {
    const toolUsage = data.toolUsageReview ? `
### 1. Tool Usage Review
- Which tools are being used most? ${data.toolUsageReview.mostUsed?.join(', ') || 'N/A'}
- Any tools not being used? ${data.toolUsageReview.notUsed?.join(', ') || 'None'}
- Any issues or blockers? ${data.toolUsageReview.issues?.join(', ') || 'None'}
` : '';

    const updates = data.updates?.map(u => `- ${u}`).join('\n') || '- None';
    const supportIssues = data.supportIssues?.map(i => `- ${i}`).join('\n') || '- None';
    const teamChanges = data.teamChanges?.map(c => `- ${c}`).join('\n') || '- None';
    const actionItems = data.actionItems?.map((item, i) => 
      `- [ ] ${item.item}${item.assignedTo ? ` - ${item.assignedTo}` : ''}${item.dueDate ? ` - ${item.dueDate}` : ''}`
    ).join('\n') || '- None';

    const satisfaction = data.satisfaction ? `
## Client Satisfaction
[${data.satisfaction === 'very-satisfied' ? 'X' : ' '}] Very Satisfied 
[${data.satisfaction === 'satisfied' ? 'X' : ' '}] Satisfied 
[${data.satisfaction === 'neutral' ? 'X' : ' '}] Neutral 
[${data.satisfaction === 'dissatisfied' ? 'X' : ' '}] Dissatisfied
` : '';

    return `# Monthly Check-in Template

## Check-in: ${data.month}/${data.year}

**Client:** ${data.client.company}  
**Date:** ${data.date}  
**Attendees:** ${data.attendees?.join(', ') || 'N/A'}

## Agenda

${toolUsage}### 2. Updates & Improvements
${updates}

### 3. Support Issues
${supportIssues}

### 4. Team Changes
${teamChanges}

### 5. Next Steps
${data.nextSteps?.map(s => `- ${s.item}${s.assignedTo ? ` (${s.assignedTo})` : ''}${s.dueDate ? ` - Due: ${s.dueDate}` : ''}`).join('\n') || '- None'}

## Notes
${data.notes || 'No notes'}

## Action Items
${actionItems}
${satisfaction}
## Renewal Discussion
${data.renewalDiscussion || 'None'}

`;
  }

  generateOnboardingChecklist(client: Client): string {
    const progress = client.onboardingProgress || {};
    const checkItem = (key: string) => progress[key] ? '[x]' : '[ ]';

    return `# Client Onboarding Checklist - DevOps Productivity Suite

## Pre-Setup Phase

### Contract & Payment
${checkItem('contract_signed')} Contract signed
${checkItem('setup_fee_received')} Setup fee received (50% or 100% depending on terms)
${checkItem('payment_confirmation')} Payment confirmation received
${checkItem('invoice_sent')} Invoice sent and recorded

### Initial Information Gathering
${checkItem('company_info')} Company name and contact details collected
${checkItem('primary_contact')} Primary contact person identified
${checkItem('team_size')} Team size confirmed
${checkItem('tech_stack')} Tech stack information received
${checkItem('repository_access')} Repository access granted (or access method confirmed)
${checkItem('cicd_platform')} CI/CD platform confirmed
${checkItem('workflow_docs')} Current workflow documentation received (if available)

### Scheduling
${checkItem('week1_call')} Week 1 discovery call scheduled
${checkItem('training_session')} Team training session scheduled (Week 3)
${checkItem('calendar_invites')} Calendar invites sent to all participants
${checkItem('timezones')} Time zones confirmed

---

## Week 1: Discovery & Configuration

### Day 1-2: Tech Stack Review
${checkItem('discovery_call')} Discovery call completed
${checkItem('tech_stack_documented')} Tech stack fully documented
${checkItem('pain_points')} Current pain points documented
${checkItem('team_structure')} Team structure and roles understood
${checkItem('repo_access')} Access to repositories/test environment obtained

### Day 3-4: Custom Configuration Development
${checkItem('shell_games_customized')} Shell Games Toolkit scripts customized
${checkItem('cicd_customized')} CI/CD workflow customized
${checkItem('git_workflow')} Git workflow strategy defined
${checkItem('code_generator')} Code generator templates created
${checkItem('entropy_rules')} Software Entropy rules configured

### Day 5: Initial Setup Planning
${checkItem('integration_plan')} Integration plan created
${checkItem('setup_docs')} Setup documentation drafted
${checkItem('risk_assessment')} Risk assessment completed
${checkItem('timeline_confirmed')} Timeline confirmed with client

---

## Week 2: Setup & Integration

### Day 1-2: Tool Installation
${checkItem('shell_games_installed')} Shell Games Toolkit installed
${checkItem('cicd_setup')} CI/CD pipeline set up
${checkItem('git_workflow_impl')} Git workflow implemented
${checkItem('code_gen_installed')} Code Generator Tool installed
${checkItem('entropy_integrated')} Software Entropy integrated

### Day 3-4: Repository Integration
${checkItem('tools_integrated')} All tools integrated into main repository
${checkItem('pipeline_running')} CI/CD pipeline running successfully
${checkItem('scripts_tested')} All automation scripts tested
${checkItem('docs_added')} Documentation added to repository
${checkItem('team_access')} Team access verified

### Day 5: Testing & Validation
${checkItem('e2e_tested')} End-to-end workflow tested
${checkItem('tools_validated')} All 5 tools validated
${checkItem('feedback_collected')} Team feedback collected (if available)
${checkItem('issues_documented')} Issues identified and documented
${checkItem('fixes_applied')} Fixes applied

---

## Week 3: Training & Handoff

### Day 1-2: Team Training
${checkItem('training_agenda')} Training agenda sent to team
${checkItem('training_materials')} Training materials prepared
${checkItem('training_session1')} Training session 1 completed (1 hour)
${checkItem('training_session2')} Training session 2 completed (1 hour)
${checkItem('training_recording')} Training recording shared (if recorded)
${checkItem('training_feedback')} Training feedback collected

### Day 3: Documentation Review
${checkItem('client_docs')} Complete documentation provided
${checkItem('docs_reviewed')} Documentation reviewed with team
${checkItem('questions_answered')} Questions answered
${checkItem('docs_updated')} Documentation updated based on feedback

### Day 4-5: Final Adjustments
${checkItem('changes_implemented')} Any requested changes implemented
${checkItem('final_testing')} Final testing completed
${checkItem('support_process')} Support process explained
${checkItem('checkin_scheduled')} Monthly check-in scheduled
${checkItem('final_invoice')} Final invoice sent (if applicable)

---

## Quick Reference

**Client:** ${client.company}  
**Start Date:** ${client.startDate}  
**Primary Contact:** ${client.contact.name}, ${client.contact.email}${client.contact.phone ? `, ${client.contact.phone}` : ''}  
**Team Size:** ${client.teamSize || 'N/A'}  
**Tech Stack:** ${client.techStack?.join(', ') || 'N/A'}  
**Repository:** ${client.repository || 'N/A'}  
**Support Plan:** Monthly ($${client.monthlyFee}/month)

`;
  }
}

export const documentGenerator = new DocumentGenerator();


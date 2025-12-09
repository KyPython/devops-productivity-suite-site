/**
 * Email templates for the DevOps Productivity Suite email sequence
 * These match the content from BUSINESS_MATERIALS/MARKETING/EMAIL_SEQUENCE.md
 */

export interface EmailTemplate {
  subject: string;
  html: string;
}

export function getWelcomeEmail(firstname: string): EmailTemplate {
  return {
    subject: "Welcome! Here's how we help dev teams save 5+ hours/week",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstname},</p>
        
        <p>Thanks for your interest in the DevOps Productivity Suite!</p>
        
        <p>I help development teams eliminate repetitive tasks and standardize their DevOps workflows. Our suite combines 5 production-ready tools that:</p>
        
        <ul>
          <li>✅ Automate CI/CD pipelines</li>
          <li>✅ Generate boilerplate code</li>
          <li>✅ Scan for technical debt</li>
          <li>✅ Standardize Git workflows</li>
          <li>✅ Eliminate manual scripting</li>
        </ul>
        
        <p><strong>The result?</strong> Your team saves 5+ hours per developer per week.</p>
        
        <p>Want to see how it works? Book a free 30-minute consultation:</p>
        
        <p style="margin: 30px 0;">
          <a href="https://calendly.com/kyjahn-smith/consultation" 
             style="background: #1560BD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Book Your Free Consultation
          </a>
        </p>
        
        <p>I'll show you exactly how the suite can be customized for your team.</p>
        
        <p>Best,<br>Kyjahn Smith</p>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          P.S. No pressure—if you're not ready yet, I'll send you some helpful resources over the next few days.
        </p>
      </body>
      </html>
    `
  };
}

export function getPainPointEmail(firstname: string): EmailTemplate {
  return {
    subject: "Tired of spending hours on boilerplate code?",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstname},</p>
        
        <p>Quick question: How much time does your team spend writing the same boilerplate code over and over?</p>
        
        <p>If it's more than a few hours per week, you're not alone. That's why we built the <strong>Code Generator Tool</strong>—one of the 5 tools in our DevOps Productivity Suite.</p>
        
        <p>Instead of manually writing:</p>
        <ul>
          <li>API endpoints</li>
          <li>CRUD operations</li>
          <li>Test files</li>
          <li>Configuration files</li>
        </ul>
        
        <p>Your team generates them from templates in seconds.</p>
        
        <p><strong>Real example:</strong> A 10-person team we worked with went from 8 hours/week on boilerplate to 30 minutes. That's 7.5 hours saved every week.</p>
        
        <p>Want to see how it works for your stack?</p>
        
        <p style="margin: 30px 0;">
          <a href="https://calendly.com/kyjahn-smith/consultation" 
             style="background: #1560BD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            See a Live Demo
          </a>
        </p>
        
        <p>Best,<br>Kyjahn Smith</p>
      </body>
      </html>
    `
  };
}

export function getROIEmail(firstname: string): EmailTemplate {
  return {
    subject: "How much is manual CI/CD costing you?",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstname},</p>
        
        <p>Let's do some quick math:</p>
        
        <p>If your team spends 3 hours/week on manual deployments and CI/CD tasks, that's:</p>
        <ul>
          <li><strong>12 hours/month per developer</strong></li>
          <li><strong>At $100/hour:</strong> $1,200/month per developer</li>
          <li><strong>For a 5-person team:</strong> $6,000/month in lost productivity</li>
        </ul>
        
        <p>Our DevOps Productivity Suite automates all of that.</p>
        
        <p><strong>Setup cost:</strong> $2,997 one-time<br>
        <strong>Monthly support:</strong> $297/month<br>
        <strong>Total first year:</strong> $6,561</p>
        
        <p><strong>ROI:</strong> You break even in month 2, then save $5,000+/month after that.</p>
        
        <p>Plus, you get:</p>
        <ul>
          <li>Automated code quality scanning</li>
          <li>Standardized Git workflows</li>
          <li>Boilerplate code generation</li>
          <li>And more</li>
        </ul>
        
        <p>Ready to calculate your team's ROI?</p>
        
        <p style="margin: 30px 0;">
          <a href="https://calendly.com/kyjahn-smith/consultation" 
             style="background: #1560BD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Book a Free Consultation
          </a>
        </p>
        
        <p>Best,<br>Kyjahn Smith</p>
      </body>
      </html>
    `
  };
}

export function getSocialProofEmail(firstname: string): EmailTemplate {
  return {
    subject: "How one team saved 6 hours/week per developer",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstname},</p>
        
        <p>I wanted to share how one team transformed their DevOps workflow with our suite.</p>
        
        <p><strong>Before:</strong></p>
        <ul>
          <li>Manual CI/CD deployments (2 hours/week)</li>
          <li>Writing boilerplate code (3 hours/week)</li>
          <li>Code quality reviews (1 hour/week)</li>
          <li><strong>Total:</strong> 6 hours/week per developer</li>
        </ul>
        
        <p><strong>After:</strong></p>
        <ul>
          <li>Automated CI/CD (15 min/week)</li>
          <li>Code generation (30 min/week)</li>
          <li>Automated scanning (15 min/week)</li>
          <li><strong>Total:</strong> 1 hour/week per developer</li>
        </ul>
        
        <p><strong>Result:</strong> 5 hours saved per developer per week.</p>
        
        <p>For a 5-person team, that's 25 hours/week saved. Over a year, that's 1,300 hours—worth $130,000+ at $100/hour.</p>
        
        <p>Want to see how we can do the same for your team?</p>
        
        <p style="margin: 30px 0;">
          <a href="https://calendly.com/kyjahn-smith/consultation" 
             style="background: #1560BD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Book Your Free Consultation
          </a>
        </p>
        
        <p>Best,<br>Kyjahn Smith</p>
      </body>
      </html>
    `
  };
}

export function getFinalPushEmail(firstname: string): EmailTemplate {
  return {
    subject: "Last chance: Free consultation this week",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstname},</p>
        
        <p>I've been sharing how the DevOps Productivity Suite helps teams save 5+ hours per developer per week.</p>
        
        <p>If you're still on the fence, here's what I want you to know:</p>
        
        <ol>
          <li><strong>Zero risk:</strong> 30-day money-back guarantee on setup</li>
          <li><strong>Customized:</strong> We configure everything for your specific tech stack</li>
          <li><strong>Supported:</strong> Ongoing updates and priority support included</li>
          <li><strong>Proven:</strong> Production-ready tools used by real teams</li>
        </ol>
        
        <p><strong>The consultation is free.</strong> No pressure, no sales pitch—just a conversation about your team's needs.</p>
        
        <p>If it's not a fit, I'll tell you. If it is, I'll show you exactly how we can help.</p>
        
        <p style="margin: 30px 0;">
          <a href="https://calendly.com/kyjahn-smith/consultation" 
             style="background: #1560BD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Book Your Free Consultation
          </a>
        </p>
        
        <p>I have a few spots open this week. Would love to chat.</p>
        
        <p>Best,<br>Kyjahn Smith</p>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          P.S. If you're not ready, no worries. I'll check back in a few months. But if you're curious, let's talk.
        </p>
      </body>
      </html>
    `
  };
}

export function getChecklistEmail(firstname: string): EmailTemplate {
  return {
    subject: "Your DevOps Automation Checklist is ready!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstname},</p>
        
        <p>Thanks for downloading the DevOps Automation Checklist!</p>
        
        <p>I've attached your copy with 25 automation tasks that can save your team 5+ hours per developer per week.</p>
        
        <p>The checklist includes:</p>
        <ul>
          <li>✅ 25 automation opportunities identified</li>
          <li>✅ Priority rankings for maximum ROI</li>
          <li>✅ Implementation difficulty ratings</li>
          <li>✅ Estimated time savings per task</li>
          <li>✅ Quick win suggestions</li>
        </ul>
        
        <p><strong>What's inside:</strong></p>
        <ul>
          <li>High-priority tasks to start with (save 22+ hours/week)</li>
          <li>Medium-priority automations (save 30+ hours/week)</li>
          <li>Low-priority nice-to-haves (save 25+ hours/week)</li>
          <li>Real examples and quick wins for each task</li>
        </ul>
        
        <p>Want help implementing these automations for your team? Book a free 30-minute consultation:</p>
        
        <p style="margin: 30px 0;">
          <a href="https://calendly.com/kyjahn-smith/consultation" 
             style="background: #1560BD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Book Your Free Consultation
          </a>
        </p>
        
        <p>I'll show you exactly how to set up these automations for your specific tech stack.</p>
        
        <p>Best,<br>Kyjahn Smith</p>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          P.S. This checklist is part of my DevOps Productivity Suite—5 production-ready tools that automate your workflow. If you're interested, let's chat!
        </p>
      </body>
      </html>
    `
  };
}


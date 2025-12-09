import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getWelcomeEmail,
  getPainPointEmail,
  getROIEmail,
  getSocialProofEmail,
  getFinalPushEmail,
  getFollowUpEmail,
  getChecklistEmail
} from './templates/email-templates';
import { withMonitoring } from './utils/middleware';

interface EmailPreview {
  step: number;
  name: string;
  subject: string;
  html: string;
  scheduledFor: string;
  delayDays: number;
}

export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  // Require authentication token
  const token = req.query.token as string;
  const expectedToken = process.env.PREVIEW_SECRET || 'preview-secret-change-me';
  
  if (!token || token !== expectedToken) {
    // Provide helpful error message
    const hasCustomSecret = !!process.env.PREVIEW_SECRET;
    const message = hasCustomSecret
      ? 'Invalid token. Check your Vercel environment variable PREVIEW_SECRET and use that token in the URL.'
      : 'A valid token is required. Add ?token=preview-secret-change-me to the URL.';
    
    res.status(401).json({ 
      error: 'Unauthorized',
      message,
      hint: hasCustomSecret 
        ? 'You have PREVIEW_SECRET set in Vercel. Use that token value, not the default.'
        : 'Use the default token: preview-secret-change-me'
    });
    return;
  }

  // Get firstname from query param or use default
  const firstname = (req.query.firstname as string) || 'John';

  // Calculate schedule dates (starting from now)
  const now = new Date();
  const sequence: EmailPreview[] = [
    {
      step: 0,
      name: 'Checklist PDF',
      ...getChecklistEmail(firstname),
      scheduledFor: 'Immediate',
      delayDays: 0
    },
    {
      step: 1,
      name: 'Welcome',
      ...getWelcomeEmail(firstname),
      scheduledFor: 'Immediate',
      delayDays: 0
    },
    {
      step: 2,
      name: 'Pain Point',
      ...getPainPointEmail(firstname),
      scheduledFor: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      delayDays: 2
    },
    {
      step: 3,
      name: 'ROI',
      ...getROIEmail(firstname),
      scheduledFor: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      delayDays: 5
    },
    {
      step: 4,
      name: 'Social Proof',
      ...getSocialProofEmail(firstname),
      scheduledFor: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      delayDays: 9
    },
    {
      step: 5,
      name: 'Final Push',
      ...getFinalPushEmail(firstname),
      scheduledFor: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString(),
      delayDays: 13
    },
    {
      step: 6,
      name: 'Follow-up',
      ...getFollowUpEmail(firstname),
      scheduledFor: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      delayDays: 20
    }
  ];

  // Helper function to escape HTML for use in srcdoc attribute (double-quoted)
  // Only escape quotes and ampersands that would break the attribute
  // Clean up whitespace to ensure consistent rendering
  const escapeHtmlForSrcdoc = (str: string): string => {
    return str
      // First escape HTML entities
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      // Clean up whitespace: collapse multiple spaces/tabs to single space
      .replace(/[ \t]+/g, ' ')
      // Remove newlines that are just whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove leading/trailing whitespace from each line
      .split('\n')
      .map(line => line.trim())
      .join(' ')
      // Final trim
      .trim();
  };

  // If HTML format requested, return a preview page
  if (req.query.format === 'html') {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Sequence Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #1560BD 0%, #0d4a94 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 {
      margin-bottom: 10px;
    }
    .header p {
      opacity: 0.9;
    }
    .controls {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .controls form {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .controls input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .controls button {
      padding: 8px 16px;
      background: #1560BD;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .controls button:hover {
      background: #0d4a94;
    }
    .email-list {
      display: grid;
      gap: 20px;
    }
    .email-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .email-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .email-header {
      background: #f8f9fa;
      padding: 15px 20px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .email-header h3 {
      color: #333;
      font-size: 18px;
    }
    .email-meta {
      display: flex;
      gap: 15px;
      font-size: 14px;
      color: #666;
    }
    .email-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-immediate {
      background: #28a745;
      color: white;
    }
    .badge-scheduled {
      background: #ffc107;
      color: #333;
    }
    .email-subject {
      padding: 15px 20px;
      background: #fff;
      border-bottom: 1px solid #e9ecef;
      font-weight: 600;
      color: #333;
    }
    .email-preview {
      padding: 20px;
      background: white;
    }
    .email-preview iframe {
      width: 100%;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      background: white;
    }
    .email-actions {
      padding: 15px 20px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary {
      background: #1560BD;
      color: white;
    }
    .btn-primary:hover {
      background: #0d4a94;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-secondary:hover {
      background: #5a6268;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary h2 {
      margin-bottom: 15px;
      color: #333;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    .summary-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .summary-item strong {
      display: block;
      font-size: 24px;
      color: #1560BD;
      margin-bottom: 5px;
    }
    .summary-item span {
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Email Sequence Preview</h1>
      <p>Preview all emails that will be sent in the sequence</p>
    </div>

    <div class="controls">
      <form method="get" action="/api/preview-emails">
        <label>
          First Name:
          <input type="text" name="firstname" value="${firstname}" placeholder="John">
        </label>
        <input type="hidden" name="format" value="html">
        <input type="hidden" name="token" value="${token}">
        <button type="submit">Update Preview</button>
      </form>
    </div>

    <div class="summary">
      <h2>Sequence Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <strong>${sequence.length}</strong>
          <span>Total Emails</span>
        </div>
        <div class="summary-item">
          <strong>${sequence.filter(e => e.delayDays === 0).length}</strong>
          <span>Immediate</span>
        </div>
        <div class="summary-item">
          <strong>${sequence.filter(e => e.delayDays > 0).length}</strong>
          <span>Scheduled</span>
        </div>
        <div class="summary-item">
          <strong>${sequence[sequence.length - 1].delayDays}</strong>
          <span>Total Days</span>
        </div>
      </div>
    </div>

    <div class="email-list">
      ${sequence.map((email, index) => `
        <div class="email-card">
          <div class="email-header">
            <h3>Email ${email.step}: ${email.name}</h3>
            <div class="email-meta">
              <span class="email-badge ${email.delayDays === 0 ? 'badge-immediate' : 'badge-scheduled'}">
                ${email.delayDays === 0 ? 'Immediate' : `Day ${email.delayDays}`}
              </span>
              ${email.delayDays > 0 ? `<span>${new Date(email.scheduledFor).toLocaleDateString()}</span>` : ''}
            </div>
          </div>
          <div class="email-subject">
            Subject: ${email.subject}
          </div>
          <div class="email-preview">
            <iframe 
              srcdoc="${escapeHtmlForSrcdoc(email.html)}" 
              style="height: 600px; width: 100%; border: none;"
              sandbox="allow-same-origin"
              onload="try { this.style.height = Math.max(600, this.contentWindow.document.body.scrollHeight + 20) + 'px'; } catch(e) {}"
            ></iframe>
          </div>
          <div class="email-actions">
            <a href="mailto:?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.html.replace(/<[^>]*>/g, ''))}" class="btn btn-primary">
              Open in Email Client
            </a>
            <button onclick="copyToClipboard(${JSON.stringify(email.html)})" class="btn btn-secondary">
              Copy HTML
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('HTML copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
      });
    }
  </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    return;
  }

  // Return JSON by default
  res.status(200).json({
    firstname,
    sequenceStartDate: now.toISOString(),
    emails: sequence
  });
});

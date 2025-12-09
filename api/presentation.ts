import { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';
import { withMonitoring } from './utils/middleware';

/**
 * Protected presentation endpoint
 * Requires token authentication to view the presentation
 */
export default withMonitoring(async (req: VercelRequest, res: VercelResponse) => {
  // Require authentication token
  const token = req.query.token as string;
  const expectedToken = process.env.PREVIEW_SECRET || 'preview-secret-change-me';
  
  if (!token || token !== expectedToken) {
    const hasCustomSecret = !!process.env.PREVIEW_SECRET;
    const hint = hasCustomSecret
      ? 'You have PREVIEW_SECRET set in Vercel. Use that token value, not the default.'
      : 'Use the default token: preview-secret-change-me';
    
    res.status(401).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Unauthorized</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .error {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 600px;
          }
          h1 { color: #d32f2f; margin-bottom: 10px; }
          p { color: #666; margin: 10px 0; }
          .hint { 
            background: #fff3cd; 
            border: 1px solid #ffc107; 
            border-radius: 4px; 
            padding: 15px; 
            margin-top: 20px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>401 Unauthorized</h1>
          <p>A valid token is required to view this presentation.</p>
          <p>Add ?token=YOUR_SECRET to the URL.</p>
          <div class="hint">
            <strong>Hint:</strong> ${hint}
          </div>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Read and serve the presentation HTML
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'presentation.html'),
      path.join(__dirname, '../../public/presentation.html'),
    ];

    let presentationHtml: string | null = null;
    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          presentationHtml = fs.readFileSync(filePath, 'utf-8');
          break;
        }
      } catch (error) {
        // Continue to next path
      }
    }

    if (!presentationHtml) {
      res.status(404).json({ error: 'Presentation file not found' });
      return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(presentationHtml);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load presentation' });
  }
});

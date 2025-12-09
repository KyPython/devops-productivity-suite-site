import { VercelRequest, VercelResponse } from '@vercel/node';
import { monitor } from './monitor';
import { logger } from './logger';
import { errorHandler } from './error-handler';

export function withMonitoring(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void> | void
) {
  return errorHandler(async (req: VercelRequest, res: VercelResponse) => {
    const startTime = Date.now();
    const originalJson = res.json.bind(res);

    // Override res.json to capture response
    res.json = function(body: unknown) {
      const duration = Date.now() - startTime;
      monitor.recordRequest({
        path: req.url || '/',
        method: req.method || 'GET',
        statusCode: res.statusCode || 200,
        duration,
        timestamp: new Date().toISOString()
      });

      logger.info('API Request', {
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });

      return originalJson(body);
    };

    await handler(req, res);
  });
}


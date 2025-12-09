import { VercelRequest, VercelResponse } from '@vercel/node';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  timestamp: string;
  path?: string;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createErrorResponse(
  error: unknown,
  req: VercelRequest
): { statusCode: number; body: ApiError } {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        path: req.url
      }
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      body: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
        path: req.url
      }
    };
  }

  return {
    statusCode: 500,
    body: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      path: req.url
    }
  };
}

export function errorHandler(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void> | void
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      const { statusCode, body } = createErrorResponse(error, req);
      res.status(statusCode).json(body);
    }
  };
}


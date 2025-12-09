import { AppError, ErrorCode, createErrorResponse } from './error-handler';
import { VercelRequest } from '@vercel/node';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create error with code and message', () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Test error', 400);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });

    it('should include details when provided', () => {
      const details = { field: 'email' };
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Test error', 400, details);
      expect(error.details).toEqual(details);
    });
  });

  describe('createErrorResponse', () => {
    const mockReq = {
      url: '/api/test'
    } as VercelRequest;

    it('should handle AppError correctly', () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400);
      const response = createErrorResponse(error, mockReq);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.path).toBe('/api/test');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error');
      const response = createErrorResponse(error, mockReq);

      expect(response.statusCode).toBe(500);
      expect(response.body.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(response.body.path).toBe('/api/test');
    });

    it('should hide error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive error details');
      const response = createErrorResponse(error, mockReq);

      expect(response.body.details).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Development error');
      const response = createErrorResponse(error, mockReq);

      expect(response.body.details).toBe('Development error');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle unknown error types', () => {
      const error = { unexpected: 'error' };
      const response = createErrorResponse(error, mockReq);

      expect(response.statusCode).toBe(500);
      expect(response.body.code).toBe(ErrorCode.INTERNAL_ERROR);
    });
  });
});


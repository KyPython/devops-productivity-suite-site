import { AppError, ErrorCode } from './error-handler';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number; pattern?: RegExp }
): string {
  if (typeof value !== 'string') {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `${fieldName} must be a string`,
      400
    );
  }

  if (options?.minLength && value.length < options.minLength) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `${fieldName} must be at least ${options.minLength} characters`,
      400
    );
  }

  if (options?.maxLength && value.length > options.maxLength) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `${fieldName} must be at most ${options.maxLength} characters`,
      400
    );
  }

  if (options?.pattern && !options.pattern.test(value)) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `${fieldName} format is invalid`,
      400
    );
  }

  return value;
}

export function validateNumber(
  value: unknown,
  fieldName: string,
  options?: { min?: number; max?: number }
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `${fieldName} must be a valid number`,
      400
    );
  }

  if (options?.min !== undefined && value < options.min) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `${fieldName} must be at least ${options.min}`,
      400
    );
  }

  if (options?.max !== undefined && value > options.max) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `${fieldName} must be at most ${options.max}`,
      400
    );
  }

  return value;
}

export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `${fieldName} is required`,
      400
    );
  }
  return value;
}


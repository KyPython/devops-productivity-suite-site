import { validateString, validateNumber, validateRequired, AppError, ErrorCode } from './validator';

describe('Validator', () => {
  describe('validateString', () => {
    it('should validate string type', () => {
      expect(validateString('test', 'field')).toBe('test');
    });

    it('should throw for non-string', () => {
      expect(() => validateString(123, 'field')).toThrow(AppError);
      expect(() => validateString(123, 'field')).toThrow(ErrorCode.VALIDATION_ERROR);
    });

    it('should validate minLength', () => {
      expect(validateString('test', 'field', { minLength: 3 })).toBe('test');
      expect(() => validateString('ab', 'field', { minLength: 3 })).toThrow();
    });

    it('should validate maxLength', () => {
      expect(validateString('test', 'field', { maxLength: 10 })).toBe('test');
      expect(() => validateString('this is too long', 'field', { maxLength: 10 })).toThrow();
    });

    it('should validate pattern', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(validateString('test@example.com', 'email', { pattern: emailPattern })).toBe('test@example.com');
      expect(() => validateString('invalid-email', 'email', { pattern: emailPattern })).toThrow();
    });
  });

  describe('validateNumber', () => {
    it('should validate number type', () => {
      expect(validateNumber(123, 'field')).toBe(123);
    });

    it('should throw for non-number', () => {
      expect(() => validateNumber('123', 'field')).toThrow();
      expect(() => validateNumber(NaN, 'field')).toThrow();
    });

    it('should validate min', () => {
      expect(validateNumber(10, 'field', { min: 5 })).toBe(10);
      expect(() => validateNumber(3, 'field', { min: 5 })).toThrow();
    });

    it('should validate max', () => {
      expect(validateNumber(5, 'field', { max: 10 })).toBe(5);
      expect(() => validateNumber(15, 'field', { max: 10 })).toThrow();
    });
  });

  describe('validateRequired', () => {
    it('should return value if not null/undefined', () => {
      expect(validateRequired('test', 'field')).toBe('test');
      expect(validateRequired(0, 'field')).toBe(0);
      expect(validateRequired(false, 'field')).toBe(false);
    });

    it('should throw for null', () => {
      expect(() => validateRequired(null, 'field')).toThrow();
    });

    it('should throw for undefined', () => {
      expect(() => validateRequired(undefined, 'field')).toThrow();
    });
  });
});


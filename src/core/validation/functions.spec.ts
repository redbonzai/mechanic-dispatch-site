/**
 * Canonical Validation Module - Function Tests
 *
 * TDD: Tests written FIRST before implementation
 *
 * @authority docs/admin/TEST_STRATEGY.md
 */

import {
  validateEmail,
  validatePassword,
  validateCuid,
  hashPassword,
  comparePassword,
} from './functions';

describe('Validation Functions (Unit Tests - 80%)', () => {
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'admin@test.com',
        'user+tag@domain.co.uk',
        'first.last@company.io',
      ];

      // Act & Assert
      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should return false for invalid email', () => {
      // Arrange
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test @example.com',
        '',
        'test',
        'test@',
        '@test.com',
      ];

      // Act & Assert
      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should return false for null/undefined', () => {
      // Act & Assert
      expect(validateEmail(null as unknown as string)).toBe(false);
      expect(validateEmail(undefined as unknown as string)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for password >= 8 chars', () => {
      // Arrange & Act & Assert
      expect(validatePassword('12345678')).toBe(true);
      expect(validatePassword('longerpassword')).toBe(true);
      expect(validatePassword('Pass123!')).toBe(true);
    });

    it('should return false for password < 8 chars', () => {
      // Arrange & Act & Assert
      expect(validatePassword('1234567')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('abc')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      // Act & Assert
      expect(validatePassword(null as unknown as string)).toBe(false);
      expect(validatePassword(undefined as unknown as string)).toBe(false);
    });
  });

  describe('validateCuid', () => {
    it('should return true for valid CUID', () => {
      // Arrange
      const validCuids = [
        'cm1a2b3c4d5e6f7g8h9i0j1k',
        'clzabcd1234567890abcdefgh',
      ];

      // Act & Assert
      validCuids.forEach((cuid) => {
        expect(validateCuid(cuid)).toBe(true);
      });
    });

    it('should return false for invalid CUID', () => {
      // Arrange
      const invalidCuids = [
        'invalid',
        'CM1a2b3c4d5e6f7g8h9i0j1k', // uppercase C
        'c123', // too short
        '',
        'not-a-cuid',
      ];

      // Act & Assert
      invalidCuids.forEach((cuid) => {
        expect(validateCuid(cuid)).toBe(false);
      });
    });

    it('should return false for null/undefined', () => {
      // Act & Assert
      expect(validateCuid(null as unknown as string)).toBe(false);
      expect(validateCuid(undefined as unknown as string)).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      // Arrange
      const password = 'password123';

      // Act
      const hash = await hashPassword(password);

      // Assert
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt hash prefix
    });

    it('should generate different hashes for same password', async () => {
      // Arrange
      const password = 'password123';

      // Act
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Assert
      expect(hash1).not.toBe(hash2); // salts differ
    });

    it('should use cost factor of 12', async () => {
      // Arrange
      const password = 'password123';

      // Act
      const hash = await hashPassword(password);

      // Assert
      // bcrypt format: $2b$12$... where 12 is the cost factor
      const costFactor = hash.split('$')[2];
      expect(costFactor).toBe('12');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      // Arrange
      const password = 'password123';
      const hash = await hashPassword(password);

      // Act
      const result = await comparePassword(password, hash);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      // Arrange
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hash = await hashPassword(password);

      // Act
      const result = await comparePassword(wrongPassword, hash);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      // Arrange
      const password = 'password123';
      const hash = await hashPassword(password);

      // Act
      const result = await comparePassword('', hash);

      // Assert
      expect(result).toBe(false);
    });
  });
});

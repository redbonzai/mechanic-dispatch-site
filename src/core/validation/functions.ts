/**
 * Canonical Validation Module - Functions
 *
 * Cross-cutting validation utilities.
 *
 * @canonical This module provides canonical validation functions
 * @authority docs/admin/CANONICAL_TYPE_ANALYSIS.md
 */

import * as bcrypt from 'bcrypt';

/**
 * Validate email format.
 *
 * Fail-fast validation for email addresses.
 *
 * @param email - Email address to validate
 * @returns True if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength.
 *
 * Fail-fast validation for password minimum length.
 *
 * @param password - Password to validate
 * @returns True if valid (>= 8 chars), false otherwise
 */
export function validatePassword(password: string): boolean {
  if (!password) {
    return false;
  }

  return password.length >= 8;
}

/**
 * Validate CUID format.
 *
 * Fail-fast validation for Prisma CUID identifiers.
 *
 * @param cuid - CUID to validate
 * @returns True if valid, false otherwise
 */
export function validateCuid(cuid: string): boolean {
  if (!cuid) {
    return false;
  }

  // CUID format: starts with 'c' or 'cl', followed by lowercase alphanumeric, 24-25 chars total
  const cuidRegex = /^c[a-z0-9]{23,24}$/;
  return cuidRegex.test(cuid);
}

/**
 * Hash password using bcrypt.
 *
 * Security requirement: bcrypt with cost factor 12.
 *
 * @param password - Plain text password
 * @returns Bcrypt hash
 * @authority docs/admin/SECURITY_REQUIREMENTS.md (Lines 527-530)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Security requirement: cost factor >= 12
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password against bcrypt hash.
 *
 * Constant-time comparison for security.
 *
 * @param password - Plain text password
 * @param hash - Bcrypt hash
 * @returns True if match, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
}

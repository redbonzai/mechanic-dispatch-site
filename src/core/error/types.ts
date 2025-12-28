/**
 * Canonical Error Module - Types
 *
 * Cross-cutting error handling types.
 *
 * @canonical This module provides canonical error types
 * @authority docs/admin/CANONICAL_TYPE_ANALYSIS.md
 */

/**
 * Standard error response format.
 *
 * Canonical type for API error responses.
 *
 * @canonical Cross-cutting error concern
 */
export interface ErrorResponse {
  /**
   * Error code (enum value).
   */
  readonly code: ErrorCode;

  /**
   * Human-readable error message.
   */
  readonly message: string;

  /**
   * HTTP status code.
   */
  readonly statusCode: number;

  /**
   * Additional error details (optional).
   */
  readonly details?: Record<string, any>;

  /**
   * Timestamp when error occurred.
   */
  readonly timestamp: string;
}

/**
 * Error code enumeration.
 *
 * Canonical error codes for the application.
 *
 * @canonical Cross-cutting error concern
 */
export enum ErrorCode {
  // Authentication errors (401)
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // Authorization errors (403)
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  FORBIDDEN = 'FORBIDDEN',

  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

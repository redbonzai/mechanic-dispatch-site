/**
 * Canonical Auth Module - Types
 *
 * Cross-cutting authentication types for JWT-based authentication.
 *
 * @canonical This module provides canonical types for authentication
 * @authority docs/admin/CANONICAL_TYPE_ANALYSIS.md
 */

/**
 * JWT configuration for token generation.
 *
 * Canonical type for JWT-based authentication configuration.
 *
 * @canonical Cross-cutting authentication concern
 */
export interface JwtConfig {
  /**
   * JWT secret key for signing tokens.
   */
  readonly secret: string;

  /**
   * Access token expiry duration.
   *
   * @default "15m" (15 minutes)
   */
  readonly accessTokenExpiresIn: string;

  /**
   * Refresh token expiry duration.
   *
   * @default "7d" (7 days)
   */
  readonly refreshTokenExpiresIn: string;

  /**
   * JWT issuer identifier.
   *
   * @optional
   */
  readonly issuer?: string;

  /**
   * JWT audience identifier.
   *
   * @optional
   */
  readonly audience?: string;
}

/**
 * JWT payload structure.
 *
 * Canonical type for decoded JWT tokens.
 *
 * @canonical Cross-cutting authentication concern
 */
export interface JwtPayload {
  /**
   * Subject (user ID).
   */
  readonly sub: string;

  /**
   * User email address.
   */
  readonly email: string;

  /**
   * User role.
   */
  readonly role: string;

  /**
   * Issued at timestamp (Unix time).
   *
   * @optional (added by JWT library)
   */
  readonly iat?: number;

  /**
   * Expiration timestamp (Unix time).
   *
   * @optional (added by JWT library)
   */
  readonly exp?: number;
}

/**
 * Authentication tokens response.
 *
 * Canonical type for login/refresh responses.
 *
 * @canonical Cross-cutting authentication concern
 */
export interface AuthTokens {
  /**
   * JWT access token (short-lived).
   */
  readonly accessToken: string;

  /**
   * JWT refresh token (long-lived).
   */
  readonly refreshToken: string;
}

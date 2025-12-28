/**
 * Admin Auth Module - Types
 *
 * Response types for admin authentication.
 * (DTOs are in ./dtos/)
 *
 * @module domains/admin/auth
 */

import * as auth from '../../../core/auth';

/**
 * Login response.
 */
export interface LoginResponse {
  readonly tokens: auth.AuthTokens;
  readonly user: AdminUserResponse;
}

/**
 * Admin user response DTO.
 */
export interface AdminUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: AdminRole;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Admin user role.
 */
export type AdminRole = 'super-admin' | 'admin' | 'moderator';

/**
 * Refresh token response.
 */
export interface RefreshResponse {
  readonly accessToken: string;
}

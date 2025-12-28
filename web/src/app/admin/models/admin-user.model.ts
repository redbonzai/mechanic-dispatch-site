/**
 * Admin User Model
 * 
 * TypeScript interfaces for admin authentication.
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminRole = 'super-admin' | 'admin' | 'moderator';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: AdminUser;
}

export interface RefreshResponse {
  accessToken: string;
}

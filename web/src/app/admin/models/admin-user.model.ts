/**
 * Admin User Model
 * 
 * TypeScript interfaces for admin authentication and user management.
 */

export type AdminRole = 'super-admin' | 'admin' | 'moderator';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  failedLoginAttempts: number;
  lastFailedLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

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

export interface CreateAdminUserRequest {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
  isActive?: boolean;
}

export interface UpdateAdminUserRequest {
  email?: string;
  name?: string;
  password?: string;
  role?: AdminRole;
  isActive?: boolean;
}

export interface AdminUserQueryParams {
  role?: AdminRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

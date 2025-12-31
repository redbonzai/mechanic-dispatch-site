/**
 * Admin User Management Types
 *
 * Type definitions for admin user management endpoints.
 *
 * References:
 * - CLAUDE.md: Module layout (types.ts / functions.ts / PascalCase.ts / index.ts)
 * - docs/standards/common/naming.md: Singular/plural conventions
 * - AdminUser Entity: prisma/schema.prisma (AdminUser model)
 */

import { AdminRole } from '../auth/types';

/**
 * Admin user list item for admin view.
 * Excludes sensitive fields (passwordHash, failedLoginAttempts).
 *
 * Endpoint: GET /admin/users
 */
export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Complete admin user details for admin view.
 * Excludes passwordHash but includes security metadata.
 *
 * Endpoint: GET /admin/users/:id
 */
export interface AdminUserDetail {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  failedLoginAttempts: number;
  lastFailedLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Query parameters for listing admin users.
 * Supports filtering, pagination, and sorting.
 */
export interface AdminUserListQuery {
  /** Filter by role */
  role?: AdminRole;

  /** Filter by active status */
  isActive?: boolean;

  /** Search by name or email */
  search?: string;

  /** Page number (1-indexed) */
  page?: number;

  /** Items per page (default: 20, max: 100) */
  limit?: number;

  /** Sort by field */
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for admin user list.
 */
export interface AdminUserListResponse {
  /** Admin user list items */
  items: AdminUserListItem[];

  /** Pagination metadata */
  pagination: {
    /** Current page (1-indexed) */
    page: number;

    /** Items per page */
    limit: number;

    /** Total number of items */
    total: number;

    /** Total number of pages */
    totalPages: number;

    /** Whether there is a next page */
    hasNext: boolean;

    /** Whether there is a previous page */
    hasPrev: boolean;
  };
}

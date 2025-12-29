/**
 * Admin Service Request Types
 *
 * Type definitions for admin service request management endpoints.
 *
 * References:
 * - CLAUDE.md: Module layout (types.ts / functions.ts / PascalCase.ts / index.ts)
 * - docs/standards/common/naming.md: Singular/plural conventions
 * - Service Request Entity: src/domains/service-requests/entities/service-request.entity.ts
 */

import { ServiceRequestStatus } from '../../service-requests/enums/service-request-status.enum';

/**
 * Service Request list item for admin view.
 * Includes customer info, vehicle, status, and payment details.
 *
 * Endpoint: GET /admin/service-requests
 */
export interface AdminServiceRequestListItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Customer information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Vehicle information
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;

  // Payment information
  amountCents: number;
  finalAmountCents: number | null;
  status: ServiceRequestStatus;

  // Location summary
  city: string;
  state: string;
}

/**
 * Complete service request details for admin view.
 * Includes all customer data, vehicle, location, payment, and work logs.
 *
 * Endpoint: GET /admin/service-requests/:id
 */
export interface AdminServiceRequestDetail {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Customer information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Full address
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Vehicle information
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;

  // Payment information
  amountCents: number;
  finalAmountCents: number | null;
  status: ServiceRequestStatus;

  // Stripe metadata (for reference only - never expose to customer)
  stripePaymentIntentId: string | null;
  finalPaymentIntentId: string | null;
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;

  // Associated work logs (populated from database)
  workLogs: WorkLogSummary[];

  // Associated reviews (populated from database)
  reviews: ReviewSummary[];
}

/**
 * Work log summary for service request detail view.
 */
export interface WorkLogSummary {
  id: string;
  createdAt: Date;
  mechanicName: string;
  hoursWorkedMinutes: number;
  payoutPercentage: number;
  notes: string | null;
}

/**
 * Review summary for service request detail view.
 */
export interface ReviewSummary {
  id: string;
  createdAt: Date;
  rating: number;
  reviewerName: string;
  reviewText: string;
  mechanicId: string;
}

/**
 * Query parameters for listing service requests.
 * Supports filtering, pagination, and sorting.
 */
export interface ServiceRequestListQuery {
  /** Filter by status */
  status?: ServiceRequestStatus;

  /** Filter by creation date (ISO 8601) - inclusive start */
  startDate?: string;

  /** Filter by creation date (ISO 8601) - inclusive end */
  endDate?: string;

  /** Search by customer name or email */
  search?: string;

  /** Page number (1-indexed) */
  page?: number;

  /** Items per page (default: 20, max: 100) */
  limit?: number;

  /** Sort by field */
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'amountCents';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for service request list.
 */
export interface ServiceRequestListResponse {
  /** Service request list items */
  items: AdminServiceRequestListItem[];

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

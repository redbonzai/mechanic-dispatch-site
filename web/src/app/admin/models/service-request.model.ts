/**
 * Admin Service Request Models
 *
 * TypeScript interfaces for admin service request management.
 * Matches backend API types exactly.
 */

export interface AdminServiceRequestListItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  amountCents: number;
  finalAmountCents: number | null;
  status: ServiceRequestStatus;
  city: string;
  state: string;
}

export interface AdminServiceRequestDetail {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  amountCents: number;
  finalAmountCents: number | null;
  status: ServiceRequestStatus;
  stripePaymentIntentId: string | null;
  finalPaymentIntentId: string | null;
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;
  workLogs: WorkLogSummary[];
  reviews: ReviewSummary[];
}

export interface WorkLogSummary {
  id: string;
  createdAt: Date;
  mechanicName: string;
  hoursWorkedMinutes: number;
  payoutPercentage: number;
  notes: string | null;
}

export interface ReviewSummary {
  id: string;
  createdAt: Date;
  rating: number;
  reviewerName: string;
  reviewText: string;
  mechanicId: string;
}

export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  FINALIZED = 'FINALIZED',
}

export interface ServiceRequestListQuery {
  status?: ServiceRequestStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'amountCents';
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceRequestListResponse {
  items: AdminServiceRequestListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

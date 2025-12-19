// This file should only contain interfaces and types, not classes or enums
// The ServiceRequest class is in ../entities/service-request.entity.ts
// The ServiceRequestStatus enum is in ../enums/service-request-status.enum.ts
// The ServiceRequestRepository abstract is in ../repositories/service-request.repository.ts

export interface ServiceRequestProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  amountCents: number;
  finalAmountCents?: number | null;
  stripePaymentIntentId?: string | null;
  finalPaymentIntentId?: string | null;
  stripeCustomerId?: string | null;
  stripePaymentMethodId?: string | null;
  status: import('../enums/service-request-status.enum').ServiceRequestStatus;
}

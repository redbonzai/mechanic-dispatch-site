import {
  ServiceRequest,
  ServiceRequestProps,
} from '../entities/service-request.entity';
import { ServiceRequestStatus } from '../enums/service-request-status.enum';

export type CreateServiceRequestData = Omit<
  ServiceRequestProps,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'stripePaymentIntentId'
  | 'status'
  | 'amountCents'
  | 'finalAmountCents'
  | 'finalPaymentIntentId'
  | 'stripeCustomerId'
  | 'stripePaymentMethodId'
> & {
  amountCents?: number;
  status?: ServiceRequestStatus;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
};

export abstract class ServiceRequestRepository {
  abstract create(data: CreateServiceRequestData): Promise<ServiceRequest>;
  abstract updateStatus(
    id: string,
    status: ServiceRequestStatus,
  ): Promise<void>;
  abstract updateStatusByPaymentIntent(
    paymentIntentId: string,
    status: ServiceRequestStatus,
  ): Promise<void>;
  abstract findById(id: string): Promise<ServiceRequest | null>;
  abstract updatePaymentMetadata(
    id: string,
    metadata: Partial<
      Pick<
        ServiceRequestProps,
        | 'stripeCustomerId'
        | 'stripePaymentMethodId'
        | 'finalAmountCents'
        | 'finalPaymentIntentId'
      >
    >,
  ): Promise<void>;
}

export const SERVICE_REQUEST_REPOSITORY = Symbol('SERVICE_REQUEST_REPOSITORY');

import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  ServiceRequestStatus,
  CreateServiceRequestData,
  SERVICE_REQUEST_REPOSITORY,
  ServiceRequestRepository,
  MECHANIC_WORK_LOG_REPOSITORY,
  MechanicWorkLogRepository,
  ServiceRequest,
} from '../interfaces';
import { PaymentAdapterAbstract, PAYMENT_ADAPTER } from '../payments';

export interface CreateRequestResult {
  requestId: string;
  clientSecret: string | null;
  customerId: string | null;
}

export interface FinalizeRequestResult {
  finalAmountCents: number;
  additionalChargeCents: number;
  finalPaymentIntentId: string | null;
}

@Injectable()
export class RequestsService {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY)
    private readonly repository: ServiceRequestRepository,
    @Inject(MECHANIC_WORK_LOG_REPOSITORY)
    private readonly workLogRepository: MechanicWorkLogRepository,
    @Inject(PAYMENT_ADAPTER)
    private readonly paymentAdapter: PaymentAdapterAbstract,
  ) {}

  async createRequest(
    data: CreateServiceRequestData,
  ): Promise<CreateRequestResult> {
    const amountCents = data.amountCents ?? 6000;
    const customer = await this.paymentAdapter.getOrCreateCustomer({
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
    });

    const paymentIntent = await this.paymentAdapter.createManualCaptureIntent({
      amountCents,
      customerId: customer.id,
      receiptEmail: data.email,
    });

    try {
      const request = await this.repository.create({
        ...data,
        amountCents,
        status: ServiceRequestStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customer.id,
      });

      return {
        requestId: request.id,
        clientSecret: paymentIntent.client_secret ?? null,
        customerId: customer.id,
      };
    } catch (error) {
      try {
        await this.paymentAdapter.cancel(paymentIntent.id);
      } catch {
        // swallow to avoid masking original error
      }

      throw error;
    }
  }

  async markAuthorized(stripePaymentIntentId: string): Promise<void> {
    await this.repository.updateStatusByPaymentIntent(
      stripePaymentIntentId,
      ServiceRequestStatus.AUTHORIZED,
    );
  }

  async markCancelled(stripePaymentIntentId: string): Promise<void> {
    await this.repository.updateStatusByPaymentIntent(
      stripePaymentIntentId,
      ServiceRequestStatus.CANCELLED,
    );
  }

  async markFailed(stripePaymentIntentId: string): Promise<void> {
    await this.repository.updateStatusByPaymentIntent(
      stripePaymentIntentId,
      ServiceRequestStatus.FAILED,
    );
  }

  async capture(requestId: string) {
    const request = await this.repository.findById(requestId);

    if (!request?.stripePaymentIntentId) {
      throw new Error('Service request is missing an authorized payment.');
    }

    const paymentIntentId = request.stripePaymentIntentId;
    const result = await this.paymentAdapter.capture(paymentIntentId);
    await this.ensurePaymentMethodCached(request);

    try {
      await this.repository.updateStatus(
        requestId,
        ServiceRequestStatus.CAPTURED,
      );
    } catch (error) {
      try {
        await this.paymentAdapter.refund(paymentIntentId);
      } catch {
        // ignore refund failure, prefer propagating DB error
      }

      try {
        await this.repository.updateStatusByPaymentIntent(
          paymentIntentId,
          ServiceRequestStatus.FAILED,
        );
      } catch {
        // best-effort fallback
      }

      throw error;
    }

    return result;
  }

  async cancel(requestId: string) {
    const request = await this.repository.findById(requestId);

    if (!request?.stripePaymentIntentId) {
      throw new Error('Service request is missing an authorized payment.');
    }

    const paymentIntentId = request.stripePaymentIntentId;
    const result = await this.paymentAdapter.cancel(paymentIntentId);

    try {
      await this.repository.updateStatus(
        requestId,
        ServiceRequestStatus.CANCELLED,
      );
    } catch (error) {
      try {
        await this.repository.updateStatusByPaymentIntent(
          paymentIntentId,
          ServiceRequestStatus.CANCELLED,
        );
      } catch {
        // best-effort fallback
      }

      throw error;
    }

    return result;
  }

  async finalize(
    requestId: string,
    finalAmountCents: number,
  ): Promise<FinalizeRequestResult> {
    const request = await this.repository.findById(requestId);

    if (!request) {
      throw new Error('Service request not found.');
    }

    if (!request.stripeCustomerId) {
      throw new Error('Missing Stripe customer for this request.');
    }

    if (finalAmountCents < request.amountCents) {
      throw new Error(
        'Final amount cannot be less than the initial authorization.',
      );
    }

    await this.ensurePaymentMethodCached(request);
    const hydratedRequest = request.stripePaymentMethodId
      ? request
      : await this.repository.findById(request.id);

    if (!hydratedRequest?.stripePaymentMethodId) {
      throw new Error('No saved payment method found for this request.');
    }

    const paymentMethodId = hydratedRequest.stripePaymentMethodId;
    const additionalChargeCents = finalAmountCents - request.amountCents;
    let finalPaymentIntentId: string | null = null;

    if (additionalChargeCents > 0) {
      const finalIntent = await this.paymentAdapter.chargeOffSession({
        amountCents: additionalChargeCents,
        customerId: request.stripeCustomerId,
        paymentMethodId,
        description: `Mechanic dispatch remaining balance for request ${request.id}`,
      });

      finalPaymentIntentId = finalIntent.id;
    }

    await this.repository.updatePaymentMetadata(requestId, {
      finalAmountCents,
      finalPaymentIntentId,
    });

    await this.repository.updateStatus(
      requestId,
      ServiceRequestStatus.FINALIZED,
    );

    return {
      finalAmountCents,
      additionalChargeCents,
      finalPaymentIntentId,
    };
  }

  async recordWorkLog(params: {
    serviceRequestId: string;
    mechanicName: string;
    hoursWorkedMinutes: number;
    payoutPercentage: number;
    notes?: string;
  }) {
    return this.workLogRepository.create({
      serviceRequestId: params.serviceRequestId,
      mechanicName: params.mechanicName,
      hoursWorkedMinutes: params.hoursWorkedMinutes,
      payoutPercentage: params.payoutPercentage,
      notes: params.notes,
    });
  }

  private async ensurePaymentMethodCached(
    request: ServiceRequest,
  ): Promise<void> {
    if (request.stripePaymentMethodId || !request.stripePaymentIntentId) {
      return;
    }

    const intent = await this.paymentAdapter.retrievePaymentIntent(
      request.stripePaymentIntentId,
    );
    if (!intent) {
      return;
    }

    const paymentMethod = intent.payment_method;
    const paymentMethodId =
      typeof paymentMethod === 'string'
        ? paymentMethod
        : (paymentMethod?.id ?? null);

    if (paymentMethodId) {
      await this.repository.updatePaymentMetadata(request.id, {
        stripePaymentMethodId: paymentMethodId,
      });
    }
  }
}

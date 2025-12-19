import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeService } from '../../stripe/services/stripe.service';
import { PaymentAdapterAbstract } from './payment-adapter.abstract';
import {
  PaymentCustomer,
  CreateCustomerPayload,
  CreatePaymentIntentPayload,
  ChargeOffSessionPayload,
  PaymentIntent,
} from '../interfaces/payment.interface';

@Injectable()
export class StripePaymentService extends PaymentAdapterAbstract {
  constructor(private readonly stripeService: StripeService) {
    super();
  }

  async getOrCreateCustomer(
    payload: CreateCustomerPayload,
  ): Promise<PaymentCustomer> {
    const customer = await this.stripeService.getOrCreateCustomer({
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
    });

    return {
      id: customer.id,
      email: customer.email ?? payload.email,
      name: customer.name ?? payload.name,
      phone: customer.phone ?? payload.phone,
    };
  }

  async createManualCaptureIntent(
    params: CreatePaymentIntentPayload,
  ): Promise<PaymentIntent> {
    const intent = await this.stripeService.createManualCaptureIntent({
      amountCents: params.amountCents,
      customerId: params.customerId,
      receiptEmail: params.receiptEmail,
      description: params.description,
    });

    return {
      id: intent.id,
      client_secret: intent.client_secret,
      payment_method: intent.payment_method,
    };
  }

  async capture(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripeService.capture(paymentIntentId);
  }

  async cancel(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripeService.cancel(paymentIntentId);
  }

  async refund(paymentIntentId: string): Promise<Stripe.Refund> {
    return this.stripeService.refund(paymentIntentId);
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripeService.retrievePaymentIntent(paymentIntentId);
  }

  async chargeOffSession(
    params: ChargeOffSessionPayload,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripeService.chargeOffSession({
      customerId: params.customerId,
      paymentMethodId: params.paymentMethodId,
      amountCents: params.amountCents,
      description: params.description,
    });
  }

  constructEventFromPayload(rawBody: Buffer, signature: string): Stripe.Event {
    return this.stripeService.constructEventFromPayload(rawBody, signature);
  }
}

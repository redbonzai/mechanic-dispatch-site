import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface StripeCustomerPayload {
  email: string;
  name: string;
  phone?: string;
}

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    });
  }

  async getOrCreateCustomer(payload: StripeCustomerPayload): Promise<Stripe.Customer> {
    const existing = await this.stripe.customers.list({
      email: payload.email,
      limit: 1,
    });

    if (existing.data.length > 0) {
      return existing.data[0];
    }

    return this.stripe.customers.create({
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
    });
  }

  createManualCaptureIntent(params: {
    amountCents: number;
    customerId: string;
    receiptEmail?: string;
    description?: string;
  }): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: 'usd',
      capture_method: 'manual',
      automatic_payment_methods: { enabled: true },
      customer: params.customerId,
      setup_future_usage: 'off_session',
      receipt_email: params.receiptEmail,
      description: params.description ?? 'Mechanic dispatch service authorization',
    });
  }

  capture(paymentIntentId: string) {
    return this.stripe.paymentIntents.capture(paymentIntentId);
  }

  cancel(paymentIntentId: string) {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  refund(paymentIntentId: string) {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });
  }

  async chargeOffSession(params: {
    customerId: string;
    paymentMethodId: string;
    amountCents: number;
    description?: string;
  }): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      customer: params.customerId,
      payment_method: params.paymentMethodId,
      amount: params.amountCents,
      currency: 'usd',
      confirm: true,
      off_session: true,
      description: params.description ?? 'Mechanic dispatch final invoice',
    });
  }

  constructEventFromPayload(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }
}


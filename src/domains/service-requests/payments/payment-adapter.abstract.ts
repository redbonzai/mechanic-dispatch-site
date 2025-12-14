import Stripe from 'stripe';
import {
  PaymentCustomer,
  CreateCustomerPayload,
  CreatePaymentIntentPayload,
  ChargeOffSessionPayload,
  PaymentIntent,
} from '../interfaces';

export abstract class PaymentAdapterAbstract {
  abstract getOrCreateCustomer(
    payload: CreateCustomerPayload,
  ): Promise<PaymentCustomer>;
  abstract createManualCaptureIntent(
    params: CreatePaymentIntentPayload,
  ): Promise<PaymentIntent>;
  abstract capture(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
  abstract cancel(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
  abstract refund(paymentIntentId: string): Promise<Stripe.Refund>;
  abstract retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent>;
  abstract chargeOffSession(
    params: ChargeOffSessionPayload,
  ): Promise<Stripe.PaymentIntent>;
  abstract constructEventFromPayload(
    rawBody: Buffer,
    signature: string,
  ): Stripe.Event;
}

export const PAYMENT_ADAPTER = Symbol('PAYMENT_ADAPTER');

import Stripe from 'stripe';

export interface PaymentCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface CreateCustomerPayload {
  email: string;
  name: string;
  phone?: string;
}

export interface CreatePaymentIntentPayload {
  amountCents: number;
  customerId: string;
  receiptEmail?: string;
  description?: string;
}

export interface ChargeOffSessionPayload {
  customerId: string;
  paymentMethodId: string;
  amountCents: number;
  description?: string;
}

export interface PaymentIntent {
  id: string;
  client_secret: string | null;
  payment_method: string | Stripe.PaymentMethod | null;
}

import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { SubscriptionsService } from '../services/subscriptions.service';

@Controller('webhooks/stripe')
export class SubscriptionWebhookController {
  private readonly logger = new Logger(SubscriptionWebhookController.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly subscriptionsService: SubscriptionsService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2024-06-20',
    });
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!this.webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      return { received: true };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      return { received: false };
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.subscriptionsService.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'invoice.payment_succeeded':
        this.logger.log(
          `Payment succeeded for invoice ${(event.data.object as Stripe.Invoice).id}`,
        );
        break;

      case 'invoice.payment_failed':
        this.logger.warn(
          `Payment failed for invoice ${(event.data.object as Stripe.Invoice).id}`,
        );
        break;

      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }
}

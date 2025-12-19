import {
  Controller,
  Headers,
  Inject,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PAYMENT_ADAPTER, PaymentAdapterAbstract } from '../payments';
import { RequestsService } from '../services/requests.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    @Inject(PAYMENT_ADAPTER)
    private readonly paymentAdapter: PaymentAdapterAbstract,
    private readonly requestsService: RequestsService,
  ) {}

  @Post()
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      return res
        .status(400)
        .json({ message: 'Missing stripe-signature header' });
    }

    if (!req.rawBody) {
      return res.status(400).json({ message: 'Request body is missing' });
    }

    try {
      const event: Stripe.Event = this.paymentAdapter.constructEventFromPayload(
        req.rawBody,
        signature,
      );

      if (event.type === 'payment_intent.amount_capturable_updated') {
        const paymentIntent = event.data.object;
        await this.requestsService.markAuthorized(paymentIntent.id);
      }

      if (event.type === 'payment_intent.canceled') {
        const paymentIntent = event.data.object;
        await this.requestsService.markCancelled(paymentIntent.id);
      }

      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        await this.requestsService.markFailed(paymentIntent.id);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(400).json({ message });
    }
  }
}

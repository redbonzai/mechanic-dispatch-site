import { Module } from '@nestjs/common';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { SubscriptionWebhookController } from './controllers/subscription-webhook.controller';
import { MechanicAuthModule } from '../mechanic-auth/mechanic-auth.module';

@Module({
  imports: [MechanicAuthModule],
  controllers: [SubscriptionsController, SubscriptionWebhookController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}

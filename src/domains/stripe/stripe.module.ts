import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './services/stripe.service';

@Module({
  imports: [ConfigModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}


import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { StripeModule } from '../stripe/stripe.module';
import { RequestsService } from './services/requests.service';
import { RequestsController } from './requests.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import {
  SERVICE_REQUEST_REPOSITORY,
  MECHANIC_WORK_LOG_REPOSITORY,
} from './interfaces';
import { PrismaServiceRequestRepository } from './repositories/prisma-service-request.repository';
import { MechanicWorkLogRepository } from './repositories/prisma-mechanic-work-log.repository';
import {
  PAYMENT_ADAPTER,
  StripePaymentService,
} from './payments';

@Module({
  imports: [DatabaseModule, StripeModule],
  controllers: [RequestsController, StripeWebhookController],
  providers: [
    RequestsService,
    {
      provide: SERVICE_REQUEST_REPOSITORY,
      useClass: PrismaServiceRequestRepository,
    },
    {
      provide: MECHANIC_WORK_LOG_REPOSITORY,
      useClass: MechanicWorkLogRepository,
    },
    {
      provide: PAYMENT_ADAPTER,
      useClass: StripePaymentService,
    },
  ],
  exports: [RequestsService],
})
export class ServiceRequestsModule {}


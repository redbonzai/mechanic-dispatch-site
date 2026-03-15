import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtMechanicGuard } from '../../mechanic-auth/guards/jwt-mechanic.guard';
import { SubscriptionsService } from '../services/subscriptions.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';

@Controller('mechanic/subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Post()
  @UseGuards(JwtMechanicGuard)
  createSubscription(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createSubscription(req.user.id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtMechanicGuard)
  cancelSubscription(@Req() req: { user: { id: string } }) {
    return this.subscriptionsService.cancelSubscription(req.user.id);
  }

  @Get('status')
  @UseGuards(JwtMechanicGuard)
  getStatus(@Req() req: { user: { id: string } }) {
    return this.subscriptionsService.getSubscriptionStatus(req.user.id);
  }
}

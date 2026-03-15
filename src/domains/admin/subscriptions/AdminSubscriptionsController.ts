import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminSubscriptionsService } from './AdminSubscriptionsService';

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard)
export class AdminSubscriptionsController {
  constructor(private readonly service: AdminSubscriptionsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('tier') tier?: string,
  ) {
    return this.service.findAll({ page, limit, status, tier });
  }

  @Get(':mechanicId')
  findOne(@Param('mechanicId') mechanicId: string) {
    return this.service.findOne(mechanicId);
  }

  @Patch(':mechanicId/comp')
  compAccount(@Param('mechanicId') mechanicId: string) {
    return this.service.compAccount(mechanicId);
  }
}

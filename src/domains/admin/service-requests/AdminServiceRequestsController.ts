import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminServiceRequestsService } from './AdminServiceRequestsService';
import {
  ServiceRequestListQuery,
  ServiceRequestListResponse,
  AdminServiceRequestDetail,
} from './types';

@Controller('admin/service-requests')
@UseGuards(JwtAuthGuard)
export class AdminServiceRequestsController {
  constructor(private readonly service: AdminServiceRequestsService) {}

  @Get()
  async list(
    @Query() query: ServiceRequestListQuery,
  ): Promise<ServiceRequestListResponse> {
    return this.service.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<AdminServiceRequestDetail> {
    const request = await this.service.getById(id);
    if (!request) {
      throw new NotFoundException(`Service request ${id} not found`);
    }
    return request;
  }
}

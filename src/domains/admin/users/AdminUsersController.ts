import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminUsersService } from './AdminUsersService';
import {
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserDetail,
} from './types';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dtos';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  async list(
    @Query() query: AdminUserListQuery,
  ): Promise<AdminUserListResponse> {
    return this.service.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<AdminUserDetail> {
    const user = await this.service.getById(id);
    if (!user) {
      throw new NotFoundException(`Admin user ${id} not found`);
    }
    return user;
  }

  @Post()
  async create(@Body() dto: CreateAdminUserDto): Promise<AdminUserDetail> {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ): Promise<AdminUserDetail> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }
}

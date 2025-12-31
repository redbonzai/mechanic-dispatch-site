/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * AdminUsersService - Admin user management operations
 *
 * CRUD operations for managing admin users.
 * Security: bcrypt (cost 12), email uniqueness, last super-admin protection
 *
 * @module domains/admin/users
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as validation from '../../../core/validation';
import {
  AdminUserListItem,
  AdminUserDetail,
  AdminUserListQuery,
  AdminUserListResponse,
} from './types';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dtos';

/** Admin user management service (SOLID compliant) */
@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List admin users with filtering and pagination.
   */
  async list(query: AdminUserListQuery): Promise<AdminUserListResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build where clause

    const where: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma where clause
    if (query.role) where.role = query.role;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma where clause
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma where clause
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.adminUser.count({ where });

    const items = await this.prisma.adminUser.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      items: items as AdminUserListItem[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get admin user by ID.
   */
  async getById(id: string): Promise<AdminUserDetail | null> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as AdminUserDetail | null;
  }

  /**
   * Create a new admin user.
   */
  async create(dto: CreateAdminUserDto): Promise<AdminUserDetail> {
    this.validateCreateDto(dto);

    await this.validateEmailUniqueness(dto.email);

    const passwordHash = await validation.hashPassword(dto.password);

    const user = await this.prisma.adminUser.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as AdminUserDetail;
  }

  /**
   * Update an admin user.
   */
  async update(id: string, dto: UpdateAdminUserDto): Promise<AdminUserDetail> {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Admin user ${id} not found`);
    }

    this.validateUpdateDto(dto);

    if (dto.email && dto.email !== user.email) {
      await this.validateEmailUniqueness(dto.email);
    }

    const updateData: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma update data
    if (dto.email) updateData.email = dto.email;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma update data
    if (dto.name) updateData.name = dto.name;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma update data
    if (dto.role) updateData.role = dto.role;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma update data
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma update data
      updateData.passwordHash = await validation.hashPassword(dto.password);
    }

    const updatedUser = await this.prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser as AdminUserDetail;
  }

  /**
   * Delete an admin user.
   * Prevents deletion of the last super-admin.
   */
  async delete(id: string): Promise<void> {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Admin user ${id} not found`);
    }

    if (user.role === 'super-admin') {
      await this.validateNotLastSuperAdmin();
    }

    await this.prisma.adminUser.delete({ where: { id } });
  }

  /** Validate create DTO (fail-fast) */
  private validateCreateDto(dto: CreateAdminUserDto): void {
    if (!dto.email || !dto.name || !dto.password || !dto.role) {
      throw new BadRequestException(
        'Email, name, password, and role are required',
      );
    }

    if (!validation.validateEmail(dto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!validation.validatePassword(dto.password)) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    if (dto.name.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }

    if (!['super-admin', 'admin', 'moderator'].includes(dto.role)) {
      throw new BadRequestException('Invalid role');
    }
  }

  /** Validate update DTO (fail-fast) */
  private validateUpdateDto(dto: UpdateAdminUserDto): void {
    if (dto.email && !validation.validateEmail(dto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (dto.password && !validation.validatePassword(dto.password)) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    if (dto.name && dto.name.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }

    if (dto.role && !['super-admin', 'admin', 'moderator'].includes(dto.role)) {
      throw new BadRequestException('Invalid role');
    }
  }

  /** Validate email uniqueness */
  private async validateEmailUniqueness(email: string): Promise<void> {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }
  }

  /** Validate not deleting the last super-admin */
  private async validateNotLastSuperAdmin(): Promise<void> {
    const superAdminCount = await this.prisma.adminUser.count({
      where: { role: 'super-admin' },
    });

    if (superAdminCount <= 1) {
      throw new BadRequestException('Cannot delete the last super-admin user');
    }
  }
}

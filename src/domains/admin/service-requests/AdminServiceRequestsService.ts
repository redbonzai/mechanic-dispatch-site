/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  AdminServiceRequestListItem,
  AdminServiceRequestDetail,
  ServiceRequestListQuery,
  ServiceRequestListResponse,
} from './types';

@Injectable()
export class AdminServiceRequestsService {
  constructor(private prisma: PrismaService) {}

  async list(
    query: ServiceRequestListQuery,
  ): Promise<ServiceRequestListResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(query);
    const total = await this.prisma.serviceRequest.count({ where });

    const items = await this.prisma.serviceRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        vehicleMake: true,
        vehicleModel: true,
        vehicleYear: true,
        amountCents: true,
        finalAmountCents: true,
        status: true,
        city: true,
        state: true,
      },
    });

    return {
      items: items as AdminServiceRequestListItem[],
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

  async getById(id: string): Promise<AdminServiceRequestDetail | null> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        workLogs: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            mechanicName: true,
            hoursWorkedMinutes: true,
            payoutPercentage: true,
            notes: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            rating: true,
            reviewerName: true,
            reviewText: true,
            mechanicId: true,
          },
        },
      },
    });

    return request as AdminServiceRequestDetail | null;
  }

  private buildWhereClause(query: ServiceRequestListQuery) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}

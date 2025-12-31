import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ServiceRequestStatus } from '../enums/service-request-status.enum';
import {
  CreateServiceRequestData,
  ServiceRequestRepository,
} from './service-request.repository';
import { ServiceRequest } from '../entities/service-request.entity';

type ServiceRequestRecord =
  Prisma.ServiceRequestGetPayload<Prisma.ServiceRequestDefaultArgs>;

@Injectable()
export class PrismaServiceRequestRepository implements ServiceRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateServiceRequestData): Promise<ServiceRequest> {
    const created = await this.prisma.serviceRequest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country ?? 'US',
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        amountCents: data.amountCents ?? 6000,
        status: this.mapStatusInput(data.status),
        stripePaymentIntentId: data.stripePaymentIntentId ?? null,
      } as Prisma.ServiceRequestUncheckedCreateInput,
    });

    return this.mapToDomain(created);
  }

  async updateStatus(id: string, status: ServiceRequestStatus): Promise<void> {
    await this.prisma.serviceRequest.update({
      where: { id },
      data: { status: this.mapStatusInput(status) },
    });
  }

  async updateStatusByPaymentIntent(
    paymentIntentId: string,
    status: ServiceRequestStatus,
  ): Promise<void> {
    await this.prisma.serviceRequest.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: this.mapStatusInput(status) },
    });
  }

  async findById(id: string): Promise<ServiceRequest | null> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return null;
    }

    return this.mapToDomain(request);
  }

  async updatePaymentMetadata(
    id: string,
    metadata: Partial<{
      stripeCustomerId: string | null;
      stripePaymentMethodId: string | null;
      finalAmountCents: number | null;
      finalPaymentIntentId: string | null;
    }>,
  ): Promise<void> {
    await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        stripeCustomerId:
          metadata.stripeCustomerId !== undefined
            ? metadata.stripeCustomerId
            : undefined,
        stripePaymentMethodId:
          metadata.stripePaymentMethodId !== undefined
            ? metadata.stripePaymentMethodId
            : undefined,
        finalAmountCents:
          metadata.finalAmountCents !== undefined
            ? metadata.finalAmountCents
            : undefined,
        finalPaymentIntentId:
          metadata.finalPaymentIntentId !== undefined
            ? metadata.finalPaymentIntentId
            : undefined,
      },
    });
  }

  private mapToDomain(record: ServiceRequestRecord): ServiceRequest {
    return ServiceRequest.create({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      addressLine1: record.addressLine1,
      addressLine2: record.addressLine2,
      city: record.city,
      state: record.state,
      postalCode: record.postalCode,
      country: record.country,
      vehicleMake: record.vehicleMake,
      vehicleModel: record.vehicleModel,
      vehicleYear: record.vehicleYear,
      amountCents: record.amountCents,
      stripePaymentIntentId: record.stripePaymentIntentId,
      finalAmountCents: record.finalAmountCents,
      finalPaymentIntentId: record.finalPaymentIntentId,
      stripeCustomerId: record.stripeCustomerId,
      stripePaymentMethodId: record.stripePaymentMethodId,
      status: this.mapStatus(record.status),
    });
  }

  private mapStatus(
    status: ServiceRequestRecord['status'],
  ): ServiceRequestStatus {
    const matched =
      ServiceRequestStatus[status as keyof typeof ServiceRequestStatus];
    if (!matched) {
      throw new Error(`Unknown service request status: ${status as string}`);
    }
    return matched;
  }

  private mapStatusInput(
    status?: ServiceRequestStatus,
  ): ServiceRequestRecord['status'] {
    return (status ??
      ServiceRequestStatus.PENDING) as ServiceRequestRecord['status'];
  }
}

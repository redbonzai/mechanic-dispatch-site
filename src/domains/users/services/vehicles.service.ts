import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: { ...dto, userId },
    });
  }

  async update(userId: string, vehicleId: string, dto: UpdateVehicleDto) {
    await this.assertOwnership(userId, vehicleId);
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: dto,
    });
  }

  async remove(userId: string, vehicleId: string) {
    await this.assertOwnership(userId, vehicleId);
    await this.prisma.vehicle.delete({ where: { id: vehicleId } });
  }

  private async assertOwnership(userId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { userId: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.userId !== userId) throw new ForbiddenException();
  }
}

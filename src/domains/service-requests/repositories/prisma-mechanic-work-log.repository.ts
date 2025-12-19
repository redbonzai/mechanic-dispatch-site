import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateMechanicWorkLogData,
  MechanicWorkLogAbstract,
} from './mechanic-work-log.abstract';
import { MechanicWorkLog } from '../entities/mechanic-work-log.entity';

@Injectable()
export class MechanicWorkLogRepository implements MechanicWorkLogAbstract {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMechanicWorkLogData): Promise<MechanicWorkLog> {
    const created = await this.prisma.mechanicWorkLog.create({
      data: {
        serviceRequestId: data.serviceRequestId,
        mechanicName: data.mechanicName,
        hoursWorkedMinutes: data.hoursWorkedMinutes,
        payoutPercentage: data.payoutPercentage,
        notes: data.notes ?? null,
      },
    });

    return this.map(created);
  }

  async listByRequest(serviceRequestId: string): Promise<MechanicWorkLog[]> {
    const logs = await this.prisma.mechanicWorkLog.findMany({
      where: { serviceRequestId },
      orderBy: { createdAt: 'asc' },
    });

    return logs.map((log) => this.map(log));
  }

  private map(record: {
    id: string;
    serviceRequestId: string;
    mechanicName: string;
    hoursWorkedMinutes: number;
    payoutPercentage: number;
    notes: string | null;
    createdAt: Date;
  }): MechanicWorkLog {
    return MechanicWorkLog.create({
      id: record.id,
      serviceRequestId: record.serviceRequestId,
      mechanicName: record.mechanicName,
      hoursWorkedMinutes: record.hoursWorkedMinutes,
      payoutPercentage: record.payoutPercentage,
      notes: record.notes,
      createdAt: record.createdAt,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    tier?: string;
  }) {
    const { page, limit, status, tier } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { subscriptionStatus: status as never } : {}),
      ...(tier ? { subscriptionTier: tier as never } : {}),
      subscriptionStatus: { not: 'INACTIVE' as never },
    };

    const [mechanics, total] = await Promise.all([
      this.prisma.mechanic.findMany({
        where,
        skip,
        take: limit,
        orderBy: { subscriptionStartAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
          subscriptionStatus: true,
          subscriptionTier: true,
          subscriptionStartAt: true,
          subscriptionEndAt: true,
          trialEndsAt: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          isActive: true,
          subscription: {
            select: {
              currentPeriodEnd: true,
              cancelAtPeriodEnd: true,
              trialEnd: true,
            },
          },
        },
      }),
      this.prisma.mechanic.count({ where }),
    ]);

    return { mechanics, total, page, limit };
  }

  async findOne(mechanicId: string) {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionStartAt: true,
        subscriptionEndAt: true,
        trialEndsAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        isActive: true,
        profileViews: true,
        searchAppearances: true,
        linkClicks: true,
        subscription: true,
      },
    });
    if (!mechanic) throw new NotFoundException('Mechanic not found');
    return mechanic;
  }

  async compAccount(mechanicId: string) {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
    });
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    return this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionTier: mechanic.subscriptionTier ?? 'BASIC',
        subscriptionStartAt: new Date(),
        subscriptionEndAt: endDate,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        subscriptionTier: true,
      },
    });
  }
}

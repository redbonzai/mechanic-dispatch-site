import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RepairGuidesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    category?: string;
    difficulty?: string;
  }) {
    const { page, limit, category, difficulty } = params;
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
      ...(category ? { systemCategory: category } : {}),
      ...(difficulty ? { difficulty: difficulty as never } : {}),
    };

    const [guides, total] = await Promise.all([
      this.prisma.repairGuide.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          symptom: true,
          systemCategory: true,
          difficulty: true,
          diyFriendly: true,
          estimatedCostMinCents: true,
          estimatedCostMaxCents: true,
          timeEstimateMinutes: true,
          relatedSkills: true,
        },
      }),
      this.prisma.repairGuide.count({ where }),
    ]);

    return { guides, total, page, limit };
  }

  async findBySlug(slug: string) {
    const guide = await this.prisma.repairGuide.findUnique({
      where: { slug },
    });
    if (!guide) throw new NotFoundException('Repair guide not found');
    return guide;
  }

  async getCategories() {
    const cats = await this.prisma.repairGuide.findMany({
      where: { isPublished: true },
      select: { systemCategory: true },
      distinct: ['systemCategory'],
    });
    return cats.map((c) => c.systemCategory).sort();
  }
}

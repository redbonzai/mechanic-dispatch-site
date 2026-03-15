import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MechanicAbstract } from '../repositories';
import { CreateMechanicData, UpdateMechanicData } from '../interfaces';
import { Mechanic as DomainMechanic } from '../entities/mechanic.entity';

type MechanicRecord = Prisma.MechanicGetPayload<Prisma.MechanicDefaultArgs>;

@Injectable()
export class PrismaMechanicRepository implements MechanicAbstract {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DomainMechanic | null> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id },
    });

    if (!mechanic) {
      return null;
    }

    return this.mapToDomain(mechanic);
  }

  async findBySlug(slug: string): Promise<DomainMechanic | null> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { slug },
    });

    if (!mechanic) {
      return null;
    }

    return this.mapToDomain(mechanic);
  }

  async findMany(params?: { isActive?: boolean }): Promise<DomainMechanic[]> {
    const where: Prisma.MechanicWhereInput = {};

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const mechanics = await this.prisma.mechanic.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return mechanics.map((mechanic) => this.mapToDomain(mechanic));
  }

  async create(data: CreateMechanicData): Promise<DomainMechanic> {
    const { skillIds, ...mechanicData } = data;
    const mechanic = await this.prisma.mechanic.create({
      data: {
        ...mechanicData,
        certifications: data.certifications ?? [],
        badges: data.badges ?? [],
        skills: skillIds
          ? {
              create: skillIds.map((skillId) => ({
                skill: { connect: { id: skillId } },
              })),
            }
          : undefined,
      },
      include: { skills: { include: { skill: true } } },
    });

    return this.mapToDomain(mechanic);
  }

  async update(id: string, data: UpdateMechanicData): Promise<DomainMechanic> {
    const { skillIds, ...updateData } = data;
    const updatePayload: Prisma.MechanicUpdateInput = {
      ...updateData,
      certifications: data.certifications,
      badges: data.badges,
    };

    if (skillIds !== undefined) {
      // Delete existing skills and create new ones
      await this.prisma.mechanicSkill.deleteMany({
        where: { mechanicId: id },
      });
      if (skillIds.length > 0) {
        updatePayload.skills = {
          create: skillIds.map((skillId) => ({
            skill: { connect: { id: skillId } },
          })),
        };
      }
    }

    const mechanic = await this.prisma.mechanic.update({
      where: { id },
      data: updatePayload,
    });

    return this.mapToDomain(mechanic);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.mechanic.delete({
      where: { id },
    });
  }

  private mapToDomain(record: MechanicRecord): DomainMechanic {
    return DomainMechanic.create({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      name: record.name,
      slug: record.slug,
      bio: record.bio,
      imageUrl: record.imageUrl,
      location: record.location,
      yearsExperience: record.yearsExperience,
      rating: record.rating,
      reviewCount: record.reviewCount,
      sinceYear: record.sinceYear,
      certifications: record.certifications,
      badges: record.badges,
      isActive: record.isActive,
    });
  }
}

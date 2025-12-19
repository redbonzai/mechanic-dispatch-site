/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Skill } from './interfaces';
import { SkillAbstract } from './repositories';

@Injectable()
export class PrismaSkillService implements SkillAbstract {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<Skill[]> {
    // Using type assertion until Prisma client is regenerated
    const skills = await (this.prisma as any).skill.findMany({
      orderBy: { name: 'asc' },
    });
    return skills;
  }

  async findById(id: string): Promise<Skill | null> {
    const skill = await (this.prisma as any).skill.findUnique({
      where: { id },
    });
    return skill;
  }
}

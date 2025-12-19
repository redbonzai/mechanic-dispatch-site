/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SkillAbstract } from '../skills/repositories';
import { Skill } from '../skills/interfaces';

@Injectable()
export class PrismaSkillRepository implements SkillAbstract {
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

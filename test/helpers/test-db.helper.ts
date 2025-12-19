import { Mechanic, PrismaClient, Skill } from '@prisma/client';

/**
 * Helper for database testing
 * Provides utilities for setting up and tearing down test database
 */
export class TestDbHelper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  /**
   * Clean all tables (in correct order to respect foreign keys)
   */
  async cleanDatabase(): Promise<void> {
    await this.prisma.mechanicWorkLog.deleteMany();
    await this.prisma.review.deleteMany();
    await this.prisma.serviceRequest.deleteMany();
    await this.prisma.mechanicSkill.deleteMany();
    await this.prisma.mechanic.deleteMany();
    await this.prisma.skill.deleteMany();
  }

  /**
   * Seed test data
   */
  async seedTestData(): Promise<{ skill1: Skill; skill2: Skill; mechanic: Mechanic }> {
    // Create test skills
    const skill1 = await this.prisma.skill.create({
      data: { name: 'Engine Repair', category: 'Engine' },
    });
    const skill2 = await this.prisma.skill.create({
      data: { name: 'Brake Service', category: 'Brakes' },
    });

    // Create test mechanic
    const mechanic = await this.prisma.mechanic.create({
      data: {
        name: 'Test Mechanic',
        slug: 'test-mechanic',
        bio: 'Test bio',
        location: 'Test Location',
        yearsExperience: 5,
        sinceYear: 2020,
        isActive: true,
        skills: {
          create: [
            { skillId: skill1.id },
            { skillId: skill2.id },
          ],
        },
      },
    });

    return { skill1, skill2, mechanic };
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Get Prisma client instance
   */
  getPrisma(): PrismaClient {
    return this.prisma;
  }
}


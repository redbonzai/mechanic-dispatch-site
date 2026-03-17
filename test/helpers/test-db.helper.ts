import { Mechanic, PrismaClient, Skill } from '@prisma/client';

/**
 * Helper for database testing
 * Provides utilities for setting up and tearing down test database.
 * Only works when a real DATABASE_URL is configured in the environment.
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
    try {
      await this.prisma.$connect();

      // New platform tables (in FK-safe order)
      await this.prisma.mechanicProfileView.deleteMany();
      await this.prisma.savedFix.deleteMany();
      await this.prisma.searchQuery.deleteMany();
      await this.prisma.mechanicSubscription.deleteMany();
      await this.prisma.mechanicRefreshToken.deleteMany();
      await this.prisma.userRefreshToken.deleteMany();
      await this.prisma.review.deleteMany();
      await this.prisma.mechanicSkill.deleteMany();
      await this.prisma.mechanic.deleteMany();
      await this.prisma.skill.deleteMany();
      await this.prisma.vehicle.deleteMany();
      await this.prisma.user.deleteMany();
      await this.prisma.repairGuide.deleteMany();

      // Admin tables
      await this.prisma.auditLog.deleteMany();
      await this.prisma.adminRefreshToken.deleteMany();
      await this.prisma.adminUser.deleteMany();
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  }

  /**
   * Seed minimal test data for mechanics integration tests
   */
  async seedTestData(): Promise<{
    skill1: Skill;
    skill2: Skill;
    mechanic: Mechanic;
  }> {
    const skill1 = await this.prisma.skill.create({
      data: { name: 'Engine Repair', category: 'Engine' },
    });
    const skill2 = await this.prisma.skill.create({
      data: { name: 'Brake Service', category: 'Brakes' },
    });

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
          create: [{ skillId: skill1.id }, { skillId: skill2.id }],
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

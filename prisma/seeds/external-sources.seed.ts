import { PrismaClient } from '@prisma/client';

const SOURCES = [
  { name: 'Internal Knowledge Base', sourceType: 'INTERNAL', baseUrl: null as string | null },
  { name: 'ALLDATA', sourceType: 'ALLDATA', baseUrl: 'https://api.alldata.com/v1' },
  { name: 'RepairPal', sourceType: 'REPAIRPAL', baseUrl: null },
  { name: 'CarMD', sourceType: 'CARMD', baseUrl: null },
  { name: 'NHTSA', sourceType: 'NHTSA', baseUrl: 'https://api.nhtsa.gov' },
] as const;

export async function seedExternalSources(prisma: PrismaClient): Promise<void> {
  console.log('Seeding external sources...');

  for (const source of SOURCES) {
    await prisma.externalSource.upsert({
      where: { name: source.name },
      update: {
        sourceType: source.sourceType,
        baseUrl: source.baseUrl,
        isActive: true,
      },
      create: {
        name: source.name,
        sourceType: source.sourceType,
        baseUrl: source.baseUrl,
        isActive: true,
      },
    });
  }

  console.log('External sources seeded');
}

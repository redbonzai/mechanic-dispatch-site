import { createPrismaClient } from './lib/create-prisma-client';
import { seedAdminUsers } from './seeds/admin.seed';
import { seedSkills } from './seeds/skills.seed';
import { seedLegacyDemoContent } from './seeds/legacy-demo-content.seed';
import { seedExternalSources } from './seeds/external-sources.seed';
import { seedIssueTaxonomy } from './seeds/issues.seed';
import { seedVehicleCatalog } from './seeds/vehicle-catalog.seed';
import { seedCanonicalGuides } from './seeds/canonical-guides.seed';
import { migrateRepairGuidesToV2 } from './seeds/migrate-repair-guides.seed';

const prisma = createPrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');
  console.log(
    'Tip: vehicle catalog defaults to whitelist makes only. Set FULL_VEHICLE_CATALOG_NHTSA=true for full NHTSA model-year sync (slow).',
  );

  await seedAdminUsers(prisma);
  await seedSkills(prisma);
  await seedLegacyDemoContent(prisma);
  await seedExternalSources(prisma);
  await seedIssueTaxonomy(prisma);
  await seedVehicleCatalog(prisma);
  await seedCanonicalGuides(prisma);

  if (process.env.SEED_MIGRATE_REPAIR_GUIDES_V2 === 'true') {
    await migrateRepairGuidesToV2(prisma);
  }

  console.log('');
  console.log('Seeding complete!');
  console.log('');
  console.log('Admin logins:');
  console.log('  admin@fixguide.com / Admin123!');
  console.log('  moderator@fixguide.com / Moderator123!');
  console.log('');
  console.log('Test mechanic login: none yet (mechanics self-register)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

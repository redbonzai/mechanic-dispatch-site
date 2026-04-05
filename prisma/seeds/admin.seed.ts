import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedAdminUsers(prisma: PrismaClient): Promise<void> {
  console.log('Seeding admin users...');
  const adminHash1 = await bcrypt.hash('Admin123!', 12);
  const adminHash2 = await bcrypt.hash('Moderator123!', 12);
  await Promise.all([
    prisma.adminUser.upsert({
      where: { id: 'admin_1' },
      update: { email: 'admin@fixguide.com', name: 'Super Admin', role: 'super-admin', isActive: true },
      create: {
        id: 'admin_1',
        email: 'admin@fixguide.com',
        name: 'Super Admin',
        passwordHash: adminHash1,
        role: 'super-admin',
        isActive: true,
      },
    }),
    prisma.adminUser.upsert({
      where: { id: 'admin_2' },
      update: { email: 'moderator@fixguide.com', name: 'Moderator', role: 'moderator', isActive: true },
      create: {
        id: 'admin_2',
        email: 'moderator@fixguide.com',
        name: 'Moderator',
        passwordHash: adminHash2,
        role: 'moderator',
        isActive: true,
      },
    }),
  ]);
  console.log('Admin users seeded');
  console.log('  admin@fixguide.com / Admin123!');
  console.log('  moderator@fixguide.com / Moderator123!');
}

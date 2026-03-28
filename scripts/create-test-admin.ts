/**
 * Create Test Admin User
 * 
 * Creates a test admin user for manual E2E testing.
 * Run with: pnpm tsx scripts/create-test-admin.ts
 */

import { createPrismaClient } from '../src/domains/database/prisma-client.factory';
import * as bcrypt from 'bcrypt';

const prisma = createPrismaClient();

async function main() {
  console.log('🔧 Creating test admin user...');

  const email = 'admin@test.com';
  const password = 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  const adminUser = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      isActive: true,
      failedLoginAttempts: 0,
    },
    create: {
      email,
      passwordHash: hashedPassword,
      name: 'Test Admin',
      role: 'super-admin',
      isActive: true,
    },
  });

  console.log('✅ Test admin user created successfully!');
  console.log('');
  console.log('📝 Test Credentials:');
  console.log('   Email:', email);
  console.log('   Password:', password);
  console.log('   Role:', adminUser.role);
  console.log('');
  console.log('🔗 Login URL: http://localhost:4200/admin/login');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

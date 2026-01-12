import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Admin Users FIRST (for authentication testing)
  console.log('👤 Seeding Admin Users...');
  const adminUsers = await Promise.all([
    prisma.adminUser.upsert({
      where: { email: 'admin@mechanic.com' },
      update: {},
      create: {
        id: 'admin_1',
        email: 'admin@mechanic.com',
        name: 'Super Admin',
        passwordHash: await bcrypt.hash('Admin123!', 12),
        role: 'super-admin',
        isActive: true,
      },
    }),
    prisma.adminUser.upsert({
      where: { email: 'moderator@mechanic.com' },
      update: {},
      create: {
        id: 'admin_2',
        email: 'moderator@mechanic.com',
        name: 'Moderator User',
        passwordHash: await bcrypt.hash('Moderator123!', 12),
        role: 'moderator',
        isActive: true,
      },
    }),
    prisma.adminUser.upsert({
      where: { email: 'staff@mechanic.com' },
      update: {},
      create: {
        id: 'admin_3',
        email: 'staff@mechanic.com',
        name: 'Staff Admin',
        passwordHash: await bcrypt.hash('Staff123!', 12),
        role: 'admin',
        isActive: true,
      },
    }),
    prisma.adminUser.upsert({
      where: { email: 'inactive@mechanic.com' },
      update: {},
      create: {
        id: 'admin_4',
        email: 'inactive@mechanic.com',
        name: 'Inactive Admin',
        passwordHash: await bcrypt.hash('Inactive123!', 12),
        role: 'admin',
        isActive: false,
      },
    }),
  ]);
  console.log(`✅ Seeded ${adminUsers.length} admin users`);
  console.log('');
  console.log('📝 Admin Login Credentials:');
  console.log('   Super Admin:  admin@mechanic.com / Admin123!');
  console.log('   Moderator:    moderator@mechanic.com / Moderator123!');
  console.log('   Staff Admin:  staff@mechanic.com / Staff123!');
  console.log('   (Inactive):   inactive@mechanic.com / Inactive123! (will fail login)');
  console.log('');

  // Seed Skills
  console.log('📝 Seeding Skills...');
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'Oil Change' },
      update: {},
      create: {
        id: 'skill_1',
        name: 'Oil Change',
        category: 'Maintenance',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Brake Pads Replacement' },
      update: {},
      create: {
        id: 'skill_2',
        name: 'Brake Pads Replacement',
        category: 'Brakes',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Battery Replacement' },
      update: {},
      create: {
        id: 'skill_3',
        name: 'Battery Replacement',
        category: 'Electrical',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Pre-purchase Car Inspection' },
      update: {},
      create: {
        id: 'skill_4',
        name: 'Pre-purchase Car Inspection',
        category: 'Inspection',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Car is not starting Diagnostic' },
      update: {},
      create: {
        id: 'skill_5',
        name: 'Car is not starting Diagnostic',
        category: 'Diagnostic',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Check Engine Light Diagnostic' },
      update: {},
      create: {
        id: 'skill_6',
        name: 'Check Engine Light Diagnostic',
        category: 'Diagnostic',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Towing and Roadside' },
      update: {},
      create: {
        id: 'skill_7',
        name: 'Towing and Roadside',
        category: 'Emergency',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Engine Repair' },
      update: {},
      create: {
        id: 'skill_8',
        name: 'Engine Repair',
        category: 'Engine',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Transmission Service' },
      update: {},
      create: {
        id: 'skill_9',
        name: 'Transmission Service',
        category: 'Transmission',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'AC Repair' },
      update: {},
      create: {
        id: 'skill_10',
        name: 'AC Repair',
        category: 'HVAC',
      },
    }),
  ]);
  console.log(`✅ Seeded ${skills.length} skills`);

  // Seed Mechanics
  console.log('🔧 Seeding Mechanics...');
  const mechanics = await Promise.all([
    prisma.mechanic.upsert({
      where: { slug: 'rocco' },
      update: {},
      create: {
        id: 'mech_1',
        name: 'Rocco',
        slug: 'rocco',
        bio: 'Rocco has been a mechanic for over 20 years. He is an ASE certified Master Technician and has worked on all makes and models of cars. He is passionate about cars and loves to help people. Rocco is a true professional and will always go the extra mile to make sure his customers are happy. He is honest, reliable, and always on time. Rocco is a great choice for all your car repair needs.',
        location: 'Los Angeles, CA',
        yearsExperience: 26,
        rating: 5.0,
        reviewCount: 303,
        jobsCompleted: 1000,
        sinceYear: 2014,
        certifications: ['ASE Master Technician'],
        badges: [],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'robert' },
      update: {},
      create: {
        id: 'mech_2',
        name: 'Robert',
        slug: 'robert',
        bio: 'Robert is a highly experienced mechanic with over 35 years in the field. Specializing in diagnostics and complex repairs, he is dedicated to providing top-notch service and ensuring customer satisfaction. His extensive knowledge covers a wide range of vehicle makes and models.',
        location: 'Los Angeles, CA',
        yearsExperience: 35,
        rating: 5.0,
        reviewCount: 675,
        jobsCompleted: 800,
        sinceYear: 2000,
        certifications: ['ASE Master Technician', 'Hybrid Certified'],
        badges: ['Top Rated', 'Expert'],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'grzegorz' },
      update: {},
      create: {
        id: 'mech_3',
        name: 'Grzegorz',
        slug: 'grzegorz',
        bio: 'Grzegorz brings 45 years of automotive expertise to every job. Known for his meticulous attention to detail and comprehensive understanding of both classic and modern vehicles.',
        location: 'Los Angeles, CA',
        yearsExperience: 45,
        rating: 5.0,
        reviewCount: 473,
        jobsCompleted: 1200,
        sinceYear: 1979,
        certifications: [],
        badges: ['Top Rated', 'Expert'],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'mike-johnson' },
      update: {},
      create: {
        id: 'mech_4',
        name: 'Mike Johnson',
        slug: 'mike-johnson',
        bio: 'Mike is a professional mechanic with extensive experience in engine diagnostics and repairs. He is known for his quick problem-solving skills and excellent customer service.',
        location: 'Los Angeles, CA',
        yearsExperience: 15,
        rating: 5.0,
        reviewCount: 150,
        jobsCompleted: 500,
        sinceYear: 2009,
        certifications: ['ASE'],
        badges: [],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'david-chen' },
      update: {},
      create: {
        id: 'mech_5',
        name: 'David Chen',
        slug: 'david-chen',
        bio: 'David specializes in electrical systems and modern vehicle diagnostics. He stays up-to-date with the latest automotive technology and diagnostic tools.',
        location: 'San Francisco, CA',
        yearsExperience: 12,
        rating: 5.0,
        reviewCount: 200,
        jobsCompleted: 600,
        sinceYear: 2012,
        certifications: ['ASE'],
        badges: [],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'james-wilson' },
      update: {},
      create: {
        id: 'mech_6',
        name: 'James Wilson',
        slug: 'james-wilson',
        bio: 'James is an expert in brake systems and suspension work. He has a reputation for thorough inspections and quality repairs.',
        location: 'San Diego, CA',
        yearsExperience: 18,
        rating: 5.0,
        reviewCount: 180,
        jobsCompleted: 550,
        sinceYear: 2006,
        certifications: ['ASE'],
        badges: [],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'robert-martinez' },
      update: {},
      create: {
        id: 'mech_7',
        name: 'Robert Martinez',
        slug: 'robert-martinez',
        bio: 'Robert specializes in starter and charging system repairs. He is known for his efficient service and fair pricing.',
        location: 'Austin, TX',
        yearsExperience: 20,
        rating: 5.0,
        reviewCount: 220,
        jobsCompleted: 650,
        sinceYear: 2004,
        certifications: ['ASE'],
        badges: [],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'thomas-anderson' },
      update: {},
      create: {
        id: 'mech_8',
        name: 'Thomas Anderson',
        slug: 'thomas-anderson',
        bio: 'Thomas is a brake specialist with years of experience in both disc and drum brake systems. He provides reliable and professional service.',
        location: 'Phoenix, AZ',
        yearsExperience: 14,
        rating: 5.0,
        reviewCount: 160,
        jobsCompleted: 480,
        sinceYear: 2010,
        certifications: ['ASE'],
        badges: [],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'william-brown' },
      update: {},
      create: {
        id: 'mech_9',
        name: 'William Brown',
        slug: 'william-brown',
        bio: 'William is an experienced mechanic specializing in routine maintenance services. He is known for his friendly demeanor and attention to detail.',
        location: 'Seattle, WA',
        yearsExperience: 16,
        rating: 5.0,
        reviewCount: 190,
        jobsCompleted: 520,
        sinceYear: 2008,
        certifications: ['ASE'],
        badges: [],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'richard-taylor' },
      update: {},
      create: {
        id: 'mech_10',
        name: 'Richard Taylor',
        slug: 'richard-taylor',
        bio: 'Richard is a battery and electrical systems expert. He provides quick and reliable service for all your battery needs.',
        location: 'Denver, CO',
        yearsExperience: 13,
        rating: 5.0,
        reviewCount: 170,
        jobsCompleted: 490,
        sinceYear: 2011,
        certifications: ['ASE'],
        badges: [],
        isActive: true,
      },
    }),
    prisma.mechanic.upsert({
      where: { slug: 'joseph-white' },
      update: {},
      create: {
        id: 'mech_11',
        name: 'Joseph White',
        slug: 'joseph-white',
        bio: 'Joseph specializes in pre-purchase inspections and comprehensive vehicle diagnostics. He helps customers make informed decisions about vehicle purchases.',
        location: 'Miami, FL',
        yearsExperience: 19,
        rating: 5.0,
        reviewCount: 210,
        jobsCompleted: 580,
        sinceYear: 2005,
        certifications: ['ASE'],
        badges: [],
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Seeded ${mechanics.length} mechanics`);

  // Seed MechanicSkills
  console.log('🔗 Linking Mechanics to Skills...');
  const mechanicSkills = [
    { id: 'ms_1', mechanicId: 'mech_1', skillId: 'skill_1' },
    { id: 'ms_2', mechanicId: 'mech_1', skillId: 'skill_2' },
    { id: 'ms_3', mechanicId: 'mech_1', skillId: 'skill_3' },
    { id: 'ms_4', mechanicId: 'mech_1', skillId: 'skill_4' },
    { id: 'ms_5', mechanicId: 'mech_1', skillId: 'skill_5' },
    { id: 'ms_6', mechanicId: 'mech_1', skillId: 'skill_6' },
    { id: 'ms_7', mechanicId: 'mech_2', skillId: 'skill_5' },
    { id: 'ms_8', mechanicId: 'mech_2', skillId: 'skill_6' },
    { id: 'ms_9', mechanicId: 'mech_2', skillId: 'skill_8' },
    { id: 'ms_10', mechanicId: 'mech_3', skillId: 'skill_1' },
    { id: 'ms_11', mechanicId: 'mech_3', skillId: 'skill_2' },
    { id: 'ms_12', mechanicId: 'mech_3', skillId: 'skill_4' },
    { id: 'ms_13', mechanicId: 'mech_3', skillId: 'skill_8' },
    { id: 'ms_14', mechanicId: 'mech_4', skillId: 'skill_5' },
    { id: 'ms_15', mechanicId: 'mech_4', skillId: 'skill_6' },
    { id: 'ms_16', mechanicId: 'mech_4', skillId: 'skill_8' },
    { id: 'ms_17', mechanicId: 'mech_5', skillId: 'skill_3' },
    { id: 'ms_18', mechanicId: 'mech_5', skillId: 'skill_5' },
    { id: 'ms_19', mechanicId: 'mech_5', skillId: 'skill_6' },
    { id: 'ms_20', mechanicId: 'mech_6', skillId: 'skill_2' },
    { id: 'ms_21', mechanicId: 'mech_6', skillId: 'skill_1' },
    { id: 'ms_22', mechanicId: 'mech_7', skillId: 'skill_5' },
    { id: 'ms_23', mechanicId: 'mech_7', skillId: 'skill_3' },
    { id: 'ms_24', mechanicId: 'mech_8', skillId: 'skill_2' },
    { id: 'ms_25', mechanicId: 'mech_9', skillId: 'skill_1' },
    { id: 'ms_26', mechanicId: 'mech_10', skillId: 'skill_3' },
    { id: 'ms_27', mechanicId: 'mech_11', skillId: 'skill_4' },
  ];

  // Delete existing mechanic skills first, then recreate
  await prisma.mechanicSkill.deleteMany({
    where: {
      id: { in: mechanicSkills.map((ms) => ms.id) },
    },
  });

  await Promise.all(
    mechanicSkills.map((ms) => prisma.mechanicSkill.create({ data: ms })),
  );
  console.log(`✅ Linked ${mechanicSkills.length} mechanic-skill relationships`);

  // Seed Reviews
  console.log('⭐ Seeding Reviews...');
  const reviews = [
    {
      id: 'rev_1',
      rating: 5,
      reviewerName: 'John D.',
      reviewerLocation: 'Los Angeles, CA',
      reviewText: 'Excellent service! Mike was professional, on time, and did a great job fixing my engine noise issue. Highly recommend!',
      carModel: '2007 BMW 335i',
      carYear: 2007,
      serviceDescription: 'Noise from engine or exhaust',
      mechanicId: 'mech_4',
    },
    {
      id: 'rev_2',
      rating: 5,
      reviewerName: 'Sarah M.',
      reviewerLocation: 'San Francisco, CA',
      reviewText: "Power door locks weren't working and David fixed them quickly. Very satisfied with the service and pricing.",
      carModel: '2020 RAM 1500',
      carYear: 2020,
      serviceDescription: 'Power door locks are not working',
      mechanicId: 'mech_5',
    },
    {
      id: 'rev_3',
      rating: 5,
      reviewerName: 'Michael R.',
      reviewerLocation: 'San Diego, CA',
      reviewText: 'Got my brake pads replaced and air filter changed. James was thorough and explained everything clearly. Great experience!',
      carModel: '2019 KIA FORTE',
      carYear: 2019,
      serviceDescription: 'Brake Pads Replacement (Front, Rear) Air Filter',
      mechanicId: 'mech_6',
    },
    {
      id: 'rev_4',
      rating: 5,
      reviewerName: 'Emily T.',
      reviewerLocation: 'Austin, TX',
      reviewText: "My car wouldn't start and Robert diagnosed and fixed the starter issue. Professional and efficient service.",
      carModel: '2007 NISSAN FRONTIER',
      carYear: 2007,
      serviceDescription: 'Starter',
      mechanicId: 'mech_7',
    },
    {
      id: 'rev_5',
      rating: 5,
      reviewerName: 'Chris L.',
      reviewerLocation: 'Phoenix, AZ',
      reviewText: 'Front brake pads replacement was done perfectly. Thomas was on time and the price was fair. Will use again!',
      carModel: '2013 HYUNDAI ELANTRA COUPE',
      carYear: 2013,
      serviceDescription: 'Brake Pads Replacement (Front)',
      mechanicId: 'mech_8',
    },
    {
      id: 'rev_6',
      rating: 5,
      reviewerName: 'Jessica K.',
      reviewerLocation: 'Seattle, WA',
      reviewText: 'Oil change service was quick and professional. William was friendly and explained the process. Great value!',
      carModel: '2018 HONDA CIVIC',
      carYear: 2018,
      serviceDescription: 'Oil Change',
      mechanicId: 'mech_9',
    },
    {
      id: 'rev_7',
      rating: 5,
      reviewerName: 'Daniel P.',
      reviewerLocation: 'Denver, CO',
      reviewText: 'Battery replacement was done in my driveway. Richard was knowledgeable and the service was completed quickly.',
      carModel: '2015 TOYOTA CAMRY',
      carYear: 2015,
      serviceDescription: 'Battery Replacement',
      mechanicId: 'mech_10',
    },
    {
      id: 'rev_8',
      rating: 5,
      reviewerName: 'Amanda H.',
      reviewerLocation: 'Miami, FL',
      reviewText: 'Pre-purchase inspection helped me make an informed decision. Joseph was thorough and provided a detailed report.',
      carModel: '2017 FORD F-150',
      carYear: 2017,
      serviceDescription: 'Pre-purchase Car Inspection',
      mechanicId: 'mech_11',
    },
  ];

  // Delete existing reviews first to avoid conflicts, then create
  await prisma.review.deleteMany({
    where: {
      id: { in: reviews.map((r) => r.id) },
    },
  });

  await Promise.all(
    reviews.map((review) => prisma.review.create({ data: review })),
  );
  console.log(`✅ Seeded ${reviews.length} reviews`);

  // Update mechanic ratings and review counts
  console.log('📊 Updating mechanic statistics...');
  const allMechanics = await prisma.mechanic.findMany();
  for (const mechanic of allMechanics) {
    const mechanicReviews = await prisma.review.findMany({
      where: { mechanicId: mechanic.id },
    });
    const avgRating =
      mechanicReviews.length > 0
        ? mechanicReviews.reduce((sum, r) => sum + r.rating, 0) / mechanicReviews.length
        : 0;

    await prisma.mechanic.update({
      where: { id: mechanic.id },
      data: {
        rating: avgRating,
        reviewCount: mechanicReviews.length,
      },
    });
  }
  console.log('✅ Updated mechanic statistics');

  // Seed Service Requests (for admin dashboard testing)
  console.log('🔧 Seeding Service Requests...');
  const serviceRequests = [
    {
      id: 'sr_1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-0101',
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4B',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'US',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleYear: 2018,
      amountCents: 15000,
      status: 'PENDING',
    },
    {
      id: 'sr_2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '+1-555-0102',
      addressLine1: '456 Oak Ave',
      addressLine2: null,
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'US',
      vehicleMake: 'Honda',
      vehicleModel: 'Accord',
      vehicleYear: 2020,
      amountCents: 12000,
      finalAmountCents: 12000,
      stripePaymentIntentId: 'pi_test_authorized_001',
      status: 'AUTHORIZED',
    },
    {
      id: 'sr_3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'mbrown@example.com',
      phone: '+1-555-0103',
      addressLine1: '789 Pine St',
      addressLine2: null,
      city: 'San Diego',
      state: 'CA',
      postalCode: '92101',
      country: 'US',
      vehicleMake: 'Ford',
      vehicleModel: 'F-150',
      vehicleYear: 2019,
      amountCents: 25000,
      finalAmountCents: 25000,
      stripePaymentIntentId: 'pi_test_captured_001',
      finalPaymentIntentId: 'pi_test_captured_001',
      status: 'CAPTURED',
    },
    {
      id: 'sr_4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phone: '+1-555-0104',
      addressLine1: '321 Elm St',
      addressLine2: 'Suite 100',
      city: 'Austin',
      state: 'TX',
      postalCode: '73301',
      country: 'US',
      vehicleMake: 'Tesla',
      vehicleModel: 'Model 3',
      vehicleYear: 2021,
      amountCents: 18000,
      finalAmountCents: 22000,
      stripePaymentIntentId: 'pi_test_finalized_001',
      finalPaymentIntentId: 'pi_test_finalized_002',
      status: 'FINALIZED',
    },
    {
      id: 'sr_5',
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'rwilson@example.com',
      phone: '+1-555-0105',
      addressLine1: '654 Maple Dr',
      addressLine2: null,
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'US',
      vehicleMake: 'Chevrolet',
      vehicleModel: 'Silverado',
      vehicleYear: 2017,
      amountCents: 9000,
      stripePaymentIntentId: 'pi_test_cancelled_001',
      status: 'CANCELLED',
    },
    {
      id: 'sr_6',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jmartinez@example.com',
      phone: '+1-555-0106',
      addressLine1: '987 Cedar Ln',
      addressLine2: null,
      city: 'Phoenix',
      state: 'AZ',
      postalCode: '85001',
      country: 'US',
      vehicleMake: 'BMW',
      vehicleModel: '3 Series',
      vehicleYear: 2022,
      amountCents: 20000,
      stripePaymentIntentId: 'pi_test_failed_001',
      status: 'FAILED',
    },
    {
      id: 'sr_7',
      firstName: 'David',
      lastName: 'Anderson',
      email: 'danderson@example.com',
      phone: '+1-555-0107',
      addressLine1: '147 Birch St',
      addressLine2: null,
      city: 'Denver',
      state: 'CO',
      postalCode: '80201',
      country: 'US',
      vehicleMake: 'Nissan',
      vehicleModel: 'Altima',
      vehicleYear: 2019,
      amountCents: 14000,
      status: 'PENDING',
    },
    {
      id: 'sr_8',
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lgarcia@example.com',
      phone: '+1-555-0108',
      addressLine1: '258 Spruce Ave',
      addressLine2: 'Unit 12',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'US',
      vehicleMake: 'Mercedes',
      vehicleModel: 'C-Class',
      vehicleYear: 2020,
      amountCents: 30000,
      finalAmountCents: 35000,
      stripePaymentIntentId: 'pi_test_finalized_003',
      finalPaymentIntentId: 'pi_test_finalized_004',
      status: 'FINALIZED',
    },
  ];

  // Delete existing service requests first to avoid conflicts
  await prisma.serviceRequest.deleteMany({
    where: {
      id: { in: serviceRequests.map((sr) => sr.id) },
    },
  });

  await Promise.all(
    serviceRequests.map((sr) => prisma.serviceRequest.create({ data: sr })),
  );
  console.log(`✅ Seeded ${serviceRequests.length} service requests`);

  // Seed Work Logs (for finalized service requests)
  console.log('⏱️  Seeding Work Logs...');
  const workLogs = [
    {
      id: 'wl_1',
      serviceRequestId: 'sr_4',
      mechanicId: 'mech_1',
      mechanicName: 'Rocco',
      hoursWorkedMinutes: 180, // 3 hours
      payoutPercentage: 70,
      notes: 'Replaced brake pads and rotors. Test drive completed successfully.',
    },
    {
      id: 'wl_2',
      serviceRequestId: 'sr_4',
      mechanicId: 'mech_2',
      mechanicName: 'Robert',
      hoursWorkedMinutes: 60, // 1 hour
      payoutPercentage: 30,
      notes: 'Assisted with brake job - diagnostic and final inspection.',
    },
    {
      id: 'wl_3',
      serviceRequestId: 'sr_8',
      mechanicId: 'mech_3',
      mechanicName: 'Grzegorz',
      hoursWorkedMinutes: 300, // 5 hours
      payoutPercentage: 100,
      notes: 'Complete transmission service. Replaced fluid and filter. Test drive successful.',
    },
  ];

  await Promise.all(
    workLogs.map((wl) => prisma.mechanicWorkLog.create({ data: wl })),
  );
  console.log(`✅ Seeded ${workLogs.length} work logs`);

  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📊 Seed Summary:');
  console.log(`   - ${adminUsers.length} admin users`);
  console.log(`   - ${skills.length} skills`);
  console.log(`   - ${mechanics.length} mechanics`);
  console.log(`   - ${mechanicSkills.length} mechanic-skill links`);
  console.log(`   - ${reviews.length} reviews`);
  console.log(`   - ${serviceRequests.length} service requests`);
  console.log(`   - ${workLogs.length} work logs`);
  console.log('');
  console.log('🔗 Quick Links:');
  console.log('   Admin Dashboard: http://localhost:4200/admin/login');
  console.log('   Customer Site:   http://localhost:4200');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


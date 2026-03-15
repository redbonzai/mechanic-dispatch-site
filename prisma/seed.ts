import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Admin Users ──────────────────────────────────────────────────────────
  // Upsert by id (stable PK) so email changes don't cause duplicate-key errors.
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

  // ─── Skills Taxonomy ──────────────────────────────────────────────────────
  console.log('Seeding skills taxonomy...');
  const skillDefs = [
    // Maintenance
    { id: 'sk_oil_change',        name: 'Oil Change',                   category: 'Maintenance' },
    { id: 'sk_air_filter',        name: 'Air Filter Replacement',       category: 'Maintenance' },
    { id: 'sk_cabin_filter',      name: 'Cabin Air Filter Replacement', category: 'Maintenance' },
    { id: 'sk_spark_plugs',       name: 'Spark Plug Replacement',       category: 'Maintenance' },
    { id: 'sk_coolant_flush',     name: 'Coolant Flush',                category: 'Maintenance' },
    { id: 'sk_transmission_svc',  name: 'Transmission Service',         category: 'Maintenance' },
    { id: 'sk_fuel_filter',       name: 'Fuel Filter Replacement',      category: 'Maintenance' },
    { id: 'sk_timing_belt',       name: 'Timing Belt / Chain Service',  category: 'Maintenance' },
    // Brakes
    { id: 'sk_brake_pads',        name: 'Brake Pad Replacement',        category: 'Brakes' },
    { id: 'sk_brake_rotors',      name: 'Brake Rotor Replacement',      category: 'Brakes' },
    { id: 'sk_brake_fluid',       name: 'Brake Fluid Flush',            category: 'Brakes' },
    { id: 'sk_brake_caliper',     name: 'Brake Caliper Replacement',    category: 'Brakes' },
    { id: 'sk_abs_diagnosis',     name: 'ABS Diagnosis & Repair',       category: 'Brakes' },
    // Electrical
    { id: 'sk_battery',           name: 'Battery Replacement',          category: 'Electrical' },
    { id: 'sk_alternator',        name: 'Alternator Replacement',       category: 'Electrical' },
    { id: 'sk_starter',           name: 'Starter Replacement',          category: 'Electrical' },
    { id: 'sk_electrical_diag',   name: 'Electrical Diagnosis',         category: 'Electrical' },
    { id: 'sk_lighting',          name: 'Lighting & Bulb Replacement',  category: 'Electrical' },
    { id: 'sk_wiring',            name: 'Wiring Repair',                category: 'Electrical' },
    // Engine
    { id: 'sk_engine_diag',       name: 'Engine Diagnosis',             category: 'Engine' },
    { id: 'sk_check_engine',      name: 'Check Engine Light Diagnosis', category: 'Engine' },
    { id: 'sk_engine_repair',     name: 'Engine Repair',                category: 'Engine' },
    { id: 'sk_overheating',       name: 'Overheating Diagnosis & Repair', category: 'Engine' },
    { id: 'sk_oil_leak',          name: 'Oil Leak Diagnosis & Repair',  category: 'Engine' },
    { id: 'sk_head_gasket',       name: 'Head Gasket Replacement',      category: 'Engine' },
    { id: 'sk_valve_cover',       name: 'Valve Cover Gasket Replacement', category: 'Engine' },
    // Transmission
    { id: 'sk_transmission_diag', name: 'Transmission Diagnosis',       category: 'Transmission' },
    { id: 'sk_transmission_rep',  name: 'Transmission Repair',          category: 'Transmission' },
    { id: 'sk_clutch',            name: 'Clutch Replacement',           category: 'Transmission' },
    // Suspension & Steering
    { id: 'sk_shocks_struts',     name: 'Shocks & Struts Replacement',  category: 'Suspension' },
    { id: 'sk_alignment',         name: 'Wheel Alignment',              category: 'Suspension' },
    { id: 'sk_ball_joints',       name: 'Ball Joint Replacement',       category: 'Suspension' },
    { id: 'sk_tie_rod',           name: 'Tie Rod Replacement',          category: 'Suspension' },
    { id: 'sk_cv_axle',           name: 'CV Axle / Boot Replacement',   category: 'Suspension' },
    { id: 'sk_power_steering',    name: 'Power Steering Service',       category: 'Suspension' },
    // HVAC
    { id: 'sk_ac_repair',         name: 'AC Repair & Recharge',         category: 'HVAC' },
    { id: 'sk_ac_compressor',     name: 'AC Compressor Replacement',    category: 'HVAC' },
    { id: 'sk_heater',            name: 'Heater Core / Blower Service', category: 'HVAC' },
    // Tires & Wheels
    { id: 'sk_tire_rotation',     name: 'Tire Rotation',                category: 'Tires' },
    { id: 'sk_tire_replacement',  name: 'Tire Replacement',             category: 'Tires' },
    { id: 'sk_flat_tire',         name: 'Flat Tire Repair',             category: 'Tires' },
    // Diagnostics
    { id: 'sk_diag_general',      name: 'General Diagnostics',          category: 'Diagnostics' },
    { id: 'sk_car_not_starting',  name: 'Car Not Starting Diagnosis',   category: 'Diagnostics' },
    { id: 'sk_noise_diag',        name: 'Noise & Vibration Diagnosis',  category: 'Diagnostics' },
    // Inspection
    { id: 'sk_pre_purchase',      name: 'Pre-Purchase Inspection',      category: 'Inspection' },
    { id: 'sk_safety_insp',       name: 'Safety Inspection',            category: 'Inspection' },
    // Emergency
    { id: 'sk_roadside',          name: 'Roadside Assistance',          category: 'Emergency' },
    { id: 'sk_towing',            name: 'Towing',                       category: 'Emergency' },
    { id: 'sk_lockout',           name: 'Lockout Service',              category: 'Emergency' },
    // Advanced
    { id: 'sk_hybrid_ev',         name: 'Hybrid & EV Service',          category: 'Advanced' },
    { id: 'sk_diesel',            name: 'Diesel Engine Service',        category: 'Advanced' },
    { id: 'sk_performance',       name: 'Performance Upgrades',         category: 'Advanced' },
  ];

  for (const skill of skillDefs) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
  }
  console.log(`${skillDefs.length} skills seeded`);

  // ─── Mechanics ────────────────────────────────────────────────────────────
  console.log('Seeding mechanics...');
  const mechanicDefs = [
    {
      id: 'mech_1', name: 'Rocco Ferraro', slug: 'rocco-ferraro',
      bio: 'ASE Master Technician with 26 years of experience. Specializes in engine diagnostics and complex repairs on all makes and models. Known for honesty and reliability.',
      location: 'Los Angeles, CA', yearsExperience: 26, sinceYear: 1998,
      certifications: ['ASE Master Technician', 'AAA Approved'], badges: ['Top Rated'],
      rating: 5.0, reviewCount: 303, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'PREMIUM' as const,
      skills: ['sk_oil_change', 'sk_brake_pads', 'sk_battery', 'sk_pre_purchase', 'sk_car_not_starting', 'sk_check_engine', 'sk_engine_diag', 'sk_oil_leak'],
    },
    {
      id: 'mech_2', name: 'Robert Kim', slug: 'robert-kim',
      bio: 'Specialist in electrical systems and modern diagnostics with 35 years of automotive experience. Expert in hybrid and EV vehicles.',
      location: 'Los Angeles, CA', yearsExperience: 35, sinceYear: 1989,
      certifications: ['ASE Master Technician', 'Hybrid/EV Certified'], badges: ['Expert'],
      rating: 5.0, reviewCount: 675, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'PRO' as const,
      skills: ['sk_car_not_starting', 'sk_check_engine', 'sk_engine_repair', 'sk_electrical_diag', 'sk_alternator', 'sk_starter', 'sk_hybrid_ev'],
    },
    {
      id: 'mech_3', name: 'Grzegorz Nowak', slug: 'grzegorz-nowak',
      bio: '45 years of automotive expertise covering everything from classics to modern vehicles. Meticulous attention to detail on every job.',
      location: 'Chicago, IL', yearsExperience: 45, sinceYear: 1979,
      certifications: ['ASE'], badges: ['Expert'],
      rating: 5.0, reviewCount: 473, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'PRO' as const,
      skills: ['sk_oil_change', 'sk_brake_pads', 'sk_pre_purchase', 'sk_engine_repair', 'sk_transmission_svc', 'sk_shocks_struts'],
    },
    {
      id: 'mech_4', name: 'Mike Johnson', slug: 'mike-johnson',
      bio: 'Quick problem-solver specializing in engine diagnostics. Known for explaining repairs clearly so customers understand what they\'re paying for.',
      location: 'Los Angeles, CA', yearsExperience: 15, sinceYear: 2009,
      certifications: ['ASE'], badges: [],
      rating: 5.0, reviewCount: 150, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'BASIC' as const,
      skills: ['sk_car_not_starting', 'sk_check_engine', 'sk_engine_diag', 'sk_engine_repair', 'sk_noise_diag'],
    },
    {
      id: 'mech_5', name: 'David Chen', slug: 'david-chen',
      bio: 'Electrical systems and modern vehicle diagnostics specialist. Stays current with the latest automotive technology and diagnostic equipment.',
      location: 'San Francisco, CA', yearsExperience: 12, sinceYear: 2012,
      certifications: ['ASE', 'Hybrid Certified'], badges: [],
      rating: 5.0, reviewCount: 200, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'BASIC' as const,
      skills: ['sk_battery', 'sk_alternator', 'sk_starter', 'sk_electrical_diag', 'sk_wiring', 'sk_lighting'],
    },
    {
      id: 'mech_6', name: 'James Wilson', slug: 'james-wilson',
      bio: 'Brake system and suspension expert. Reputation for thorough inspections and high-quality repairs. Serving San Diego for 18 years.',
      location: 'San Diego, CA', yearsExperience: 18, sinceYear: 2006,
      certifications: ['ASE'], badges: [],
      rating: 5.0, reviewCount: 180, isActive: true, subscriptionStatus: 'TRIALING' as const, subscriptionTier: 'PRO' as const,
      skills: ['sk_brake_pads', 'sk_brake_rotors', 'sk_brake_fluid', 'sk_abs_diagnosis', 'sk_oil_change', 'sk_shocks_struts'],
    },
    {
      id: 'mech_7', name: 'Robert Martinez', slug: 'robert-martinez',
      bio: 'Starter and charging system specialist. Known for efficient, fairly-priced service and clear communication with customers.',
      location: 'Austin, TX', yearsExperience: 20, sinceYear: 2004,
      certifications: ['ASE'], badges: [],
      rating: 5.0, reviewCount: 220, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'BASIC' as const,
      skills: ['sk_car_not_starting', 'sk_starter', 'sk_alternator', 'sk_battery', 'sk_electrical_diag'],
    },
    {
      id: 'mech_8', name: 'Sarah Thompson', slug: 'sarah-thompson',
      bio: 'AC and HVAC specialist with 14 years of experience. Expert in recharge, compressor replacement, and heater core repairs.',
      location: 'Phoenix, AZ', yearsExperience: 14, sinceYear: 2010,
      certifications: ['ASE', 'EPA 609 Certified'], badges: [],
      rating: 4.9, reviewCount: 160, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'BASIC' as const,
      skills: ['sk_ac_repair', 'sk_ac_compressor', 'sk_heater', 'sk_cabin_filter', 'sk_check_engine'],
    },
    {
      id: 'mech_9', name: 'William Brown', slug: 'william-brown',
      bio: 'Routine maintenance specialist who keeps your car running perfectly. Friendly, thorough, and detail-oriented.',
      location: 'Seattle, WA', yearsExperience: 16, sinceYear: 2008,
      certifications: ['ASE'], badges: [],
      rating: 5.0, reviewCount: 190, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'BASIC' as const,
      skills: ['sk_oil_change', 'sk_air_filter', 'sk_cabin_filter', 'sk_tire_rotation', 'sk_spark_plugs', 'sk_coolant_flush'],
    },
    {
      id: 'mech_10', name: 'Richard Taylor', slug: 'richard-taylor',
      bio: 'Battery and electrical systems expert providing quick, reliable service for all your battery and charging needs.',
      location: 'Denver, CO', yearsExperience: 13, sinceYear: 2011,
      certifications: ['ASE'], badges: [],
      rating: 5.0, reviewCount: 170, isActive: true, subscriptionStatus: 'TRIALING' as const, subscriptionTier: 'BASIC' as const,
      skills: ['sk_battery', 'sk_alternator', 'sk_starter', 'sk_electrical_diag'],
    },
    {
      id: 'mech_11', name: 'Joseph White', slug: 'joseph-white',
      bio: 'Pre-purchase inspection and comprehensive diagnostics specialist. Helps buyers make informed vehicle purchasing decisions.',
      location: 'Miami, FL', yearsExperience: 19, sinceYear: 2005,
      certifications: ['ASE'], badges: [],
      rating: 5.0, reviewCount: 210, isActive: true, subscriptionStatus: 'ACTIVE' as const, subscriptionTier: 'BASIC' as const,
      skills: ['sk_pre_purchase', 'sk_safety_insp', 'sk_diag_general', 'sk_noise_diag'],
    },
  ];

  for (const { skills, ...mech } of mechanicDefs) {
    await prisma.mechanic.upsert({
      where: { slug: mech.slug },
      update: { rating: mech.rating, reviewCount: mech.reviewCount },
      create: {
        ...mech,
        certifications: mech.certifications,
        badges: mech.badges,
      },
    });
    // Re-link skills
    await prisma.mechanicSkill.deleteMany({ where: { mechanicId: mech.id } });
    for (const skillId of skills) {
      const skill = await prisma.skill.findUnique({ where: { id: skillId } });
      if (skill) {
        await prisma.mechanicSkill.create({ data: { mechanicId: mech.id, skillId } });
      }
    }
  }
  console.log(`${mechanicDefs.length} mechanics seeded`);

  // ─── Reviews ──────────────────────────────────────────────────────────────
  console.log('Seeding reviews...');
  const reviewDefs = [
    { id: 'rev_1', rating: 5, reviewerName: 'John D.', reviewerLocation: 'Los Angeles, CA', reviewText: 'Rocco diagnosed my check engine light within minutes. It was an O2 sensor. Fixed the same day. Incredible service.', carModel: '2007 BMW 335i', carYear: 2007, serviceDescription: 'Check Engine Light Diagnosis', mechanicId: 'mech_1' },
    { id: 'rev_2', rating: 5, reviewerName: 'Sarah M.', reviewerLocation: 'San Francisco, CA', reviewText: 'David was amazing — figured out why my car wouldn\'t start. Dead alternator. Had it replaced in under 2 hours.', carModel: '2020 RAM 1500', carYear: 2020, serviceDescription: 'Car Not Starting Diagnosis', mechanicId: 'mech_5' },
    { id: 'rev_3', rating: 5, reviewerName: 'Michael R.', reviewerLocation: 'San Diego, CA', reviewText: 'Brake pads and rotors replaced by James. Super thorough, explained everything, and the brakes feel brand new.', carModel: '2019 KIA Forte', carYear: 2019, serviceDescription: 'Brake Pad & Rotor Replacement', mechanicId: 'mech_6' },
    { id: 'rev_4', rating: 5, reviewerName: 'Emily T.', reviewerLocation: 'Austin, TX', reviewText: 'My Frontier wouldn\'t crank. Robert diagnosed a bad starter and had it replaced on-site. Professional and fast.', carModel: '2007 Nissan Frontier', carYear: 2007, serviceDescription: 'Starter Replacement', mechanicId: 'mech_7' },
    { id: 'rev_5', rating: 5, reviewerName: 'Chris L.', reviewerLocation: 'Phoenix, AZ', reviewText: 'Sarah recharged my AC and it\'s blowing ice cold again. Fair price and done in an hour. Highly recommend!', carModel: '2013 Hyundai Elantra', carYear: 2013, serviceDescription: 'AC Repair & Recharge', mechanicId: 'mech_8' },
    { id: 'rev_6', rating: 5, reviewerName: 'Jessica K.', reviewerLocation: 'Seattle, WA', reviewText: 'William did my oil change, air filter, and tire rotation in one visit. Friendly and thorough. Great value.', carModel: '2018 Honda Civic', carYear: 2018, serviceDescription: 'Oil Change & Maintenance', mechanicId: 'mech_9' },
    { id: 'rev_7', rating: 5, reviewerName: 'Daniel P.', reviewerLocation: 'Denver, CO', reviewText: 'Battery died in my driveway. Richard was there in 30 minutes with the right battery. 10/10.', carModel: '2015 Toyota Camry', carYear: 2015, serviceDescription: 'Battery Replacement', mechanicId: 'mech_10' },
    { id: 'rev_8', rating: 5, reviewerName: 'Amanda H.', reviewerLocation: 'Miami, FL', reviewText: 'Joseph\'s pre-purchase inspection saved me from buying a lemon. Detailed report, honest opinion. Worth every penny.', carModel: '2017 Ford F-150', carYear: 2017, serviceDescription: 'Pre-Purchase Inspection', mechanicId: 'mech_11' },
  ];

  for (const review of reviewDefs) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {},
      create: review,
    });
  }
  console.log(`${reviewDefs.length} reviews seeded`);

  // ─── Repair Guides ────────────────────────────────────────────────────────
  console.log('Seeding repair guides...');
  const guideDefs = [
    {
      id: 'rg_01', title: 'Check Engine Light On',
      slug: 'check-engine-light-on',
      symptom: 'check engine light on', systemCategory: 'Engine',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: false,
      estimatedCostMinCents: 10000, estimatedCostMaxCents: 50000,
      timeEstimateMinutes: 60,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Check Engine Light Diagnosis', 'Engine Diagnosis', 'General Diagnostics'],
      steps: [
        { order: 1, description: 'Connect an OBD-II scanner to the diagnostic port under your dashboard (driver\'s side).', tip: 'Auto parts stores will scan for free.' },
        { order: 2, description: 'Record all fault codes (e.g., P0420, P0171). Research each code to understand the affected system.' },
        { order: 3, description: 'Check for obvious issues first: loose gas cap (tighten it), loose vacuum hoses, visible damage under hood.' },
        { order: 4, description: 'Address the root cause per the fault codes. Common causes: O2 sensor, catalytic converter, mass airflow sensor, EVAP system.' },
        { order: 5, description: 'Clear the code with the scanner and test drive 50+ miles to verify the light stays off.' },
      ],
      tools: ['OBD-II scanner', 'Basic hand tools'],
      parts: ['Varies by fault code'],
      warnings: ['Do not ignore a flashing check engine light — this indicates a misfire that can damage your catalytic converter. Stop driving and call a mechanic.'],
    },
    {
      id: 'rg_02', title: 'Car Won\'t Start — Diagnosis Guide',
      slug: 'car-wont-start-diagnosis',
      symptom: 'car not starting', systemCategory: 'Electrical',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: true,
      estimatedCostMinCents: 5000, estimatedCostMaxCents: 80000,
      timeEstimateMinutes: 30,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Car Not Starting Diagnosis', 'Battery Replacement', 'Starter Replacement', 'Alternator Replacement'],
      steps: [
        { order: 1, description: 'Turn the key — does it click once? Multiple clicks? Silence? These tell different stories.', tip: 'One loud click = starter solenoid. Rapid clicking = low battery. Silence = no power or neutral safety switch.' },
        { order: 2, description: 'Check the battery: look for corroded terminals (white/blue buildup). Clean with baking soda and water if corroded.' },
        { order: 3, description: 'Test battery voltage with a multimeter: 12.6V = fully charged, below 12.2V = discharged, below 10V = dead.' },
        { order: 4, description: 'If battery is good, test the starter by tapping it lightly with a hammer while someone tries to start the car.' },
        { order: 5, description: 'Check the alternator — if the car starts but dies shortly after, the alternator is likely not charging.' },
      ],
      tools: ['Multimeter', 'Jumper cables or jump starter'],
      parts: ['Battery (if dead)', 'Starter (if failed)', 'Alternator (if not charging)'],
      warnings: ['Never jump-start a visibly cracked or leaking battery — it can explode.'],
    },
    {
      id: 'rg_03', title: 'Brake Pads Squealing or Grinding',
      slug: 'brake-pads-squealing-grinding',
      symptom: 'brake squealing grinding', systemCategory: 'Brakes',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: true,
      estimatedCostMinCents: 15000, estimatedCostMaxCents: 40000,
      timeEstimateMinutes: 90,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Brake Pad Replacement', 'Brake Rotor Replacement'],
      steps: [
        { order: 1, description: 'Inspect brake pads through the wheel spokes. Minimum pad thickness is 3mm — if at or below wear indicators, replace immediately.' },
        { order: 2, description: 'Lift the car safely on a level surface with jack stands. Never work under a car supported only by a floor jack.' },
        { order: 3, description: 'Remove the wheel, then the caliper bolts. Hang the caliper with a wire hook — do not let it hang by the brake hose.' },
        { order: 4, description: 'Slide out the old pads. If the rotor surface has grooves deeper than 1mm, replace the rotor too.' },
        { order: 5, description: 'Compress the caliper piston with a C-clamp. Install new pads with caliper grease on the backing plate (not on the friction surface).' },
        { order: 6, description: 'Reassemble, torque lug nuts to spec, and pump the brake pedal until firm before moving the car.' },
      ],
      tools: ['Floor jack', 'Jack stands', 'C-clamp', 'Socket set', 'Torque wrench'],
      parts: ['Brake pads', 'Brake rotors (if worn)', 'Caliper grease'],
      warnings: ['Do not drive with grinding brakes — metal-on-metal contact will destroy rotors rapidly. Brake failure is a safety emergency.'],
    },
    {
      id: 'rg_04', title: 'Dead Battery — Replacement Guide',
      slug: 'dead-battery-replacement',
      symptom: 'dead battery replacement', systemCategory: 'Electrical',
      difficulty: 'BEGINNER' as const, diyFriendly: true,
      estimatedCostMinCents: 8000, estimatedCostMaxCents: 25000,
      timeEstimateMinutes: 30,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Battery Replacement', 'Electrical Diagnosis'],
      steps: [
        { order: 1, description: 'Test the battery: if it reads below 12.2V at rest or fails a load test, replacement is needed.' },
        { order: 2, description: 'Loosen the negative (-) terminal bolt first, remove the cable, then do the positive (+) side.' },
        { order: 3, description: 'Remove the battery hold-down clamp and lift out the battery. Batteries are heavy — lift with your legs.' },
        { order: 4, description: 'Install the new battery. Connect positive (+) first, then negative (-).' },
        { order: 5, description: 'Apply anti-corrosion spray or a thin layer of petroleum jelly to the terminals.' },
      ],
      tools: ['Wrenches or socket set', 'Battery terminal brush', 'Multimeter'],
      parts: ['Battery (match group size and cold-cranking amps to your vehicle spec)'],
      warnings: ['Never connect negative before positive — always negative last on install, negative first on removal. Reversing polarity can destroy your car\'s electronics.'],
    },
    {
      id: 'rg_05', title: 'Engine Overheating',
      slug: 'engine-overheating',
      symptom: 'engine overheating', systemCategory: 'Cooling',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: false,
      estimatedCostMinCents: 15000, estimatedCostMaxCents: 150000,
      timeEstimateMinutes: 60,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Overheating Diagnosis & Repair', 'Coolant Flush', 'Engine Diagnosis'],
      steps: [
        { order: 1, description: 'STOP DRIVING IMMEDIATELY if your temperature gauge is in the red or a warning light appears. Continued driving causes catastrophic engine damage.' },
        { order: 2, description: 'Let the engine cool completely (at least 30 minutes). Never open the radiator cap on a hot engine — steam can cause severe burns.' },
        { order: 3, description: 'Check the coolant level in the overflow reservoir (the translucent tank). Low coolant = potential leak.' },
        { order: 4, description: 'Inspect hoses and connections for cracks, bulges, or loose clamps. Look underneath for puddles of green/orange liquid.' },
        { order: 5, description: 'Check if the radiator fan runs when the engine is warm. A failed fan causes overheating at low speeds.' },
        { order: 6, description: 'Common causes: coolant leak, broken thermostat, failed water pump, clogged radiator. Each requires different repair.' },
      ],
      tools: ['Flashlight', 'Multimeter (for fan testing)'],
      parts: ['Coolant', 'Thermostat (if stuck closed)', 'Water pump (if leaking)', 'Radiator cap'],
      warnings: ['If you see white smoke from the exhaust AND the car overheats, you may have a blown head gasket — a major repair. Stop driving immediately and call a mechanic.'],
    },
    {
      id: 'rg_06', title: 'Oil Leak Detection & Repair',
      slug: 'oil-leak-detection-repair',
      symptom: 'oil leak', systemCategory: 'Engine',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: true,
      estimatedCostMinCents: 5000, estimatedCostMaxCents: 120000,
      timeEstimateMinutes: 60,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Oil Leak Diagnosis & Repair', 'Valve Cover Gasket Replacement', 'Oil Change'],
      steps: [
        { order: 1, description: 'Confirm it\'s engine oil: dark brown/black, slippery texture, smells burnt. (Coolant is sweet-smelling and green/orange.)' },
        { order: 2, description: 'Clean the engine bay with degreaser and rinse. Let dry, then run the engine to find fresh leak origin.' },
        { order: 3, description: 'Common leak sources: valve cover gasket (top of engine), oil pan gasket (bottom), drain plug, oil filter, rear main seal.' },
        { order: 4, description: 'Valve cover gaskets: remove valve cover bolts, pry off carefully, clean mating surface, install new gasket with RTV sealant at corners.' },
        { order: 5, description: 'Oil drain plug: if leaking, replace the crush washer and torque to spec (typically 25-30 ft-lbs). Over-tightening strips threads.' },
      ],
      tools: ['Socket set', 'Torque wrench', 'Gasket scraper', 'Degreaser'],
      parts: ['Valve cover gasket', 'Drain plug crush washer', 'RTV sealant'],
      warnings: ['An oil leak that reaches the exhaust can cause a fire. Clean oil off hot surfaces immediately and monitor levels daily until repaired.'],
    },
    {
      id: 'rg_07', title: 'AC Not Blowing Cold Air',
      slug: 'ac-not-blowing-cold',
      symptom: 'ac not working', systemCategory: 'HVAC',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: false,
      estimatedCostMinCents: 10000, estimatedCostMaxCents: 120000,
      timeEstimateMinutes: 45,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['AC Repair & Recharge', 'AC Compressor Replacement', 'Cabin Air Filter Replacement'],
      steps: [
        { order: 1, description: 'Check the cabin air filter first — a clogged filter restricts airflow and is easy/cheap to replace.' },
        { order: 2, description: 'With the AC on, listen for the compressor clutch engaging (a click from under the hood). If no click, check the AC fuse.' },
        { order: 3, description: 'If the compressor runs but air is warm, the refrigerant is likely low. This requires an EPA-certified technician with proper equipment.' },
        { order: 4, description: 'Check the condenser (in front of the radiator) for debris or damage. Clean it with water if clogged.' },
        { order: 5, description: 'If the compressor doesn\'t run and fuses are OK, it may be a failed compressor clutch or low refrigerant shutoff switch.' },
      ],
      tools: ['Cabin air filter', 'Flashlight'],
      parts: ['Cabin air filter', 'Refrigerant (R-134a or R-1234yf)', 'Compressor (if failed)'],
      warnings: ['Refrigerant handling requires EPA 609 certification. DIY recharge cans can overcharge the system and damage the compressor if refrigerant is actually leaking.'],
    },
    {
      id: 'rg_08', title: 'Transmission Slipping or Rough Shifting',
      slug: 'transmission-slipping-rough-shifting',
      symptom: 'transmission slipping', systemCategory: 'Transmission',
      difficulty: 'PROFESSIONAL' as const, diyFriendly: false,
      estimatedCostMinCents: 50000, estimatedCostMaxCents: 400000,
      timeEstimateMinutes: 120,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Transmission Diagnosis', 'Transmission Repair', 'Transmission Service'],
      steps: [
        { order: 1, description: 'Note symptoms: when does it happen? Cold start only? All gears? Specific gear? RPMs flare without speed increase?' },
        { order: 2, description: 'Check transmission fluid (if accessible on your vehicle): fluid should be pink/red and smell slightly sweet. Dark brown or burnt smell = degraded fluid.' },
        { order: 3, description: 'Scan for transmission-specific fault codes (P07xx series) with an OBD-II scanner.' },
        { order: 4, description: 'A transmission service (fluid + filter change) can sometimes resolve mild slipping from degraded fluid. Cost: $150-$300.' },
        { order: 5, description: 'Internal slipping (clutch packs, solenoids, valvebody) requires a transmission specialist. Get 3 quotes before proceeding.' },
      ],
      tools: ['OBD-II scanner', 'Transmission fluid dipstick'],
      parts: ['Transmission fluid', 'Transmission filter (for service)'],
      warnings: ['Continuing to drive with a slipping transmission accelerates internal damage and can turn a $500 repair into a $4000 rebuild. Get it diagnosed quickly.'],
    },
    {
      id: 'rg_09', title: 'Oil Change — Step by Step',
      slug: 'oil-change-diy',
      symptom: 'oil change', systemCategory: 'Maintenance',
      difficulty: 'BEGINNER' as const, diyFriendly: true,
      estimatedCostMinCents: 3000, estimatedCostMaxCents: 10000,
      timeEstimateMinutes: 45,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Oil Change'],
      steps: [
        { order: 1, description: 'Warm up the engine for 5 minutes to thin the oil. Then turn it off and let it cool 5 minutes before working underneath.' },
        { order: 2, description: 'Place drain pan under the oil drain plug (under the engine). Remove plug with the correct wrench size — usually 14-17mm.' },
        { order: 3, description: 'Let oil drain fully (5-10 minutes). Replace the drain plug washer and reinstall, torquing to 25-30 ft-lbs.' },
        { order: 4, description: 'Remove the oil filter. Pre-fill the new filter with fresh oil. Apply thin coat of oil on the new filter\'s rubber gasket.' },
        { order: 5, description: 'Install the new filter hand-tight, then 3/4 turn more. Fill engine with specified oil type and amount from the oil cap on top.' },
        { order: 6, description: 'Start engine, check for leaks at the drain plug and filter. Check oil level with the dipstick after shutting off.' },
      ],
      tools: ['Oil drain pan', 'Oil filter wrench', 'Socket set', 'Funnel', 'Jack and stands (if needed)'],
      parts: ['Motor oil (check owner\'s manual for spec)', 'Oil filter'],
      warnings: ['Never put the car on just a floor jack — use jack stands. Used motor oil is hazardous waste; take it to an auto parts store for free recycling.'],
    },
    {
      id: 'rg_10', title: 'Car Shaking or Vibrating While Driving',
      slug: 'car-shaking-vibrating',
      symptom: 'car shaking vibrating', systemCategory: 'Suspension',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: false,
      estimatedCostMinCents: 5000, estimatedCostMaxCents: 80000,
      timeEstimateMinutes: 30,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Noise & Vibration Diagnosis', 'Wheel Alignment', 'Tire Rotation', 'Shocks & Struts Replacement'],
      steps: [
        { order: 1, description: 'Identify when it happens: highway speeds only (wheel balance), low speeds (tire damage or bent rim), braking (warped rotors), or always (tire/wheel issue).' },
        { order: 2, description: 'Inspect all tires for uneven wear, bulges, or objects embedded in the tread.' },
        { order: 3, description: 'Check tire pressure — under-inflated tires can cause vibration.' },
        { order: 4, description: 'If vibration is at highway speeds, try a wheel balance ($20-40 per tire). This is the most common cause.' },
        { order: 5, description: 'If steering wheel shakes under braking, the front rotors may be warped. Brake rotor replacement resolves this.' },
      ],
      tools: ['Tire pressure gauge'],
      parts: ['Varies by diagnosis'],
      warnings: ['Vibration at high speed that gets progressively worse could indicate a wheel about to separate. Have it inspected promptly.'],
    },
    {
      id: 'rg_11', title: 'Flat Tire — How to Change and Repair',
      slug: 'flat-tire-change-repair',
      symptom: 'flat tire', systemCategory: 'Tires',
      difficulty: 'BEGINNER' as const, diyFriendly: true,
      estimatedCostMinCents: 2000, estimatedCostMaxCents: 20000,
      timeEstimateMinutes: 30,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Flat Tire Repair', 'Tire Replacement', 'Roadside Assistance'],
      steps: [
        { order: 1, description: 'Move safely off the road, as far from traffic as possible. Turn on hazard lights.' },
        { order: 2, description: 'Loosen the lug nuts slightly BEFORE jacking up the car (so the wheel doesn\'t spin).' },
        { order: 3, description: 'Jack the car at the frame\'s designated jack point (see owner\'s manual). Never jack under the door sill or body panels.' },
        { order: 4, description: 'Remove lug nuts fully, swap the wheel, hand-tighten lug nuts in a star pattern.' },
        { order: 5, description: 'Lower the car, then torque lug nuts to spec in a star pattern (typically 80-100 ft-lbs). Never cross-thread by tightening in a circle.' },
      ],
      tools: ['Spare tire', 'Jack (in your trunk)', 'Lug wrench'],
      parts: ['Spare tire or patch kit'],
      warnings: ['Temporary spare ("donut") tires are limited to 50 mph and 50-70 miles. Don\'t drive long distances on them.'],
    },
    {
      id: 'rg_12', title: 'Car Pulling to One Side While Driving',
      slug: 'car-pulling-to-one-side',
      symptom: 'car pulling to one side', systemCategory: 'Suspension',
      difficulty: 'BEGINNER' as const, diyFriendly: false,
      estimatedCostMinCents: 8000, estimatedCostMaxCents: 30000,
      timeEstimateMinutes: 60,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Wheel Alignment', 'Tire Rotation', 'Noise & Vibration Diagnosis'],
      steps: [
        { order: 1, description: 'Check tire pressure on all four tires first — uneven pressure is the most common and easiest fix.' },
        { order: 2, description: 'Swap front tires left-to-right and test drive. If pulling direction changes, the problem is a tire (defective or uneven wear).' },
        { order: 3, description: 'If pulling remains after swapping tires, the vehicle likely needs a wheel alignment ($75-$150 at most shops).' },
        { order: 4, description: 'Severe pulling can indicate a stuck brake caliper (car pulls toward the dragging wheel). Check if one wheel is hotter than others after driving.' },
      ],
      tools: ['Tire pressure gauge'],
      parts: ['None for alignment check'],
      warnings: ['Driving out of alignment accelerates tire wear — you can lose 10,000+ miles of tire life. Get it aligned annually or after any suspension work.'],
    },
    {
      id: 'rg_13', title: 'Starter Motor Failure',
      slug: 'starter-motor-failure',
      symptom: 'car clicks but wont start', systemCategory: 'Electrical',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: true,
      estimatedCostMinCents: 20000, estimatedCostMaxCents: 80000,
      timeEstimateMinutes: 90,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Starter Replacement', 'Car Not Starting Diagnosis', 'Electrical Diagnosis'],
      steps: [
        { order: 1, description: 'Confirm the battery is fully charged first (12.6V). A weak battery mimics starter failure.' },
        { order: 2, description: 'Turn key to start — one loud click or nothing (with good battery) = failed starter or solenoid.' },
        { order: 3, description: 'Tap the starter lightly with a hammer while a helper tries to start. If it then starts, the starter is worn and needs replacement.' },
        { order: 4, description: 'Locate the starter (follows the positive battery cable to the engine block). Disconnect the battery first.' },
        { order: 5, description: 'Disconnect wiring harness from starter, remove mounting bolts (usually 2-3), and pull out old starter. Install reverse order.' },
      ],
      tools: ['Socket set', 'Breaker bar', 'Multimeter', 'Hammer'],
      parts: ['Replacement starter motor'],
      warnings: ['Always disconnect the battery before working on electrical components. The starter circuit carries very high current.'],
    },
    {
      id: 'rg_14', title: 'Pre-Purchase Car Inspection Checklist',
      slug: 'pre-purchase-car-inspection',
      symptom: 'pre purchase inspection', systemCategory: 'Inspection',
      difficulty: 'INTERMEDIATE' as const, diyFriendly: true,
      estimatedCostMinCents: 10000, estimatedCostMaxCents: 20000,
      timeEstimateMinutes: 60,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Pre-Purchase Inspection', 'Safety Inspection', 'General Diagnostics'],
      steps: [
        { order: 1, description: 'Get a vehicle history report (Carfax or AutoCheck) with the VIN. Look for accidents, salvage titles, odometer rollbacks, and service history.' },
        { order: 2, description: 'Inspect the exterior in daylight: look for mismatched paint, uneven panel gaps, or wavy lines that indicate previous body work.' },
        { order: 3, description: 'Check under the hood: look for coolant or oil leaks, cracked hoses, corrosion, and the condition of fluids.' },
        { order: 4, description: 'Test all electronics: windows, locks, AC/heat, lights, infotainment. Problems here add up quickly.' },
        { order: 5, description: 'Test drive: accelerate, brake hard, turn fully in both directions. Listen for any unusual noises.' },
        { order: 6, description: 'Hire a mechanic to perform an independent inspection ($100-$200). This is the single best investment you can make on a used car purchase.' },
      ],
      tools: ['Flashlight', 'OBD-II scanner (to check for hidden fault codes)'],
      parts: ['None'],
      warnings: ['Never skip the independent inspection. Private sellers cannot be held liable for undisclosed problems in most states.'],
    },
    {
      id: 'rg_15', title: 'Spark Plug Replacement',
      slug: 'spark-plug-replacement',
      symptom: 'rough idle misfires', systemCategory: 'Engine',
      difficulty: 'BEGINNER' as const, diyFriendly: true,
      estimatedCostMinCents: 5000, estimatedCostMaxCents: 30000,
      timeEstimateMinutes: 60,
      vehicleMakes: [], vehicleModels: [],
      relatedSkills: ['Spark Plug Replacement', 'Engine Diagnosis', 'Check Engine Light Diagnosis'],
      steps: [
        { order: 1, description: 'Check your maintenance schedule — most modern vehicles need spark plugs every 60,000-100,000 miles (iridium/platinum). Older vehicles every 30,000.' },
        { order: 2, description: 'Let the engine cool completely. Remove the ignition coil or spark plug wire from the first cylinder.' },
        { order: 3, description: 'Use a spark plug socket (with rubber insert to protect the plug) and extension to remove the old plug.' },
        { order: 4, description: 'Inspect the old plug: black and sooty = rich mixture/oil burning; white = too lean/overheating; normal = light tan/gray.' },
        { order: 5, description: 'Install new plug to the correct gap spec. Hand-tighten into the threads, then torque to spec (typically 12-18 ft-lbs).' },
        { order: 6, description: 'Reconnect the coil/wire. Repeat for each cylinder.' },
      ],
      tools: ['Spark plug socket (5/8" or 13/16")', 'Torque wrench', 'Spark plug gap tool'],
      parts: ['Spark plugs (match the OEM spec for your vehicle)'],
      warnings: ['Cross-threading spark plugs into aluminum heads is a costly mistake. Always thread in by hand first.'],
    },
  ];

  for (const guide of guideDefs) {
    await prisma.repairGuide.upsert({
      where: { slug: guide.slug },
      update: {},
      create: guide,
    });
  }
  console.log(`${guideDefs.length} repair guides seeded`);

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

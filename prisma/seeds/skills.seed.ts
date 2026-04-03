import { PrismaClient } from '@prisma/client';

export async function seedSkills(prisma: PrismaClient): Promise<void> {
  console.log('Seeding skills taxonomy...');
  const skillDefs = [
    { id: 'sk_oil_change', name: 'Oil Change', category: 'Maintenance' },
    { id: 'sk_air_filter', name: 'Air Filter Replacement', category: 'Maintenance' },
    { id: 'sk_cabin_filter', name: 'Cabin Air Filter Replacement', category: 'Maintenance' },
    { id: 'sk_spark_plugs', name: 'Spark Plug Replacement', category: 'Maintenance' },
    { id: 'sk_coolant_flush', name: 'Coolant Flush', category: 'Maintenance' },
    { id: 'sk_transmission_svc', name: 'Transmission Service', category: 'Maintenance' },
    { id: 'sk_fuel_filter', name: 'Fuel Filter Replacement', category: 'Maintenance' },
    { id: 'sk_timing_belt', name: 'Timing Belt / Chain Service', category: 'Maintenance' },
    { id: 'sk_brake_pads', name: 'Brake Pad Replacement', category: 'Brakes' },
    { id: 'sk_brake_rotors', name: 'Brake Rotor Replacement', category: 'Brakes' },
    { id: 'sk_brake_fluid', name: 'Brake Fluid Flush', category: 'Brakes' },
    { id: 'sk_brake_caliper', name: 'Brake Caliper Replacement', category: 'Brakes' },
    { id: 'sk_abs_diagnosis', name: 'ABS Diagnosis & Repair', category: 'Brakes' },
    { id: 'sk_battery', name: 'Battery Replacement', category: 'Electrical' },
    { id: 'sk_alternator', name: 'Alternator Replacement', category: 'Electrical' },
    { id: 'sk_starter', name: 'Starter Replacement', category: 'Electrical' },
    { id: 'sk_electrical_diag', name: 'Electrical Diagnosis', category: 'Electrical' },
    { id: 'sk_lighting', name: 'Lighting & Bulb Replacement', category: 'Electrical' },
    { id: 'sk_wiring', name: 'Wiring Repair', category: 'Electrical' },
    { id: 'sk_engine_diag', name: 'Engine Diagnosis', category: 'Engine' },
    { id: 'sk_check_engine', name: 'Check Engine Light Diagnosis', category: 'Engine' },
    { id: 'sk_engine_repair', name: 'Engine Repair', category: 'Engine' },
    { id: 'sk_overheating', name: 'Overheating Diagnosis & Repair', category: 'Engine' },
    { id: 'sk_oil_leak', name: 'Oil Leak Diagnosis & Repair', category: 'Engine' },
    { id: 'sk_head_gasket', name: 'Head Gasket Replacement', category: 'Engine' },
    { id: 'sk_valve_cover', name: 'Valve Cover Gasket Replacement', category: 'Engine' },
    { id: 'sk_transmission_diag', name: 'Transmission Diagnosis', category: 'Transmission' },
    { id: 'sk_transmission_rep', name: 'Transmission Repair', category: 'Transmission' },
    { id: 'sk_clutch', name: 'Clutch Replacement', category: 'Transmission' },
    { id: 'sk_shocks_struts', name: 'Shocks & Struts Replacement', category: 'Suspension' },
    { id: 'sk_alignment', name: 'Wheel Alignment', category: 'Suspension' },
    { id: 'sk_ball_joints', name: 'Ball Joint Replacement', category: 'Suspension' },
    { id: 'sk_tie_rod', name: 'Tie Rod Replacement', category: 'Suspension' },
    { id: 'sk_cv_axle', name: 'CV Axle / Boot Replacement', category: 'Suspension' },
    { id: 'sk_power_steering', name: 'Power Steering Service', category: 'Suspension' },
    { id: 'sk_ac_repair', name: 'AC Repair & Recharge', category: 'HVAC' },
    { id: 'sk_ac_compressor', name: 'AC Compressor Replacement', category: 'HVAC' },
    { id: 'sk_heater', name: 'Heater Core / Blower Service', category: 'HVAC' },
    { id: 'sk_tire_rotation', name: 'Tire Rotation', category: 'Tires' },
    { id: 'sk_tire_replacement', name: 'Tire Replacement', category: 'Tires' },
    { id: 'sk_flat_tire', name: 'Flat Tire Repair', category: 'Tires' },
    { id: 'sk_diag_general', name: 'General Diagnostics', category: 'Diagnostics' },
    { id: 'sk_car_not_starting', name: 'Car Not Starting Diagnosis', category: 'Diagnostics' },
    { id: 'sk_noise_diag', name: 'Noise & Vibration Diagnosis', category: 'Diagnostics' },
    { id: 'sk_pre_purchase', name: 'Pre-Purchase Inspection', category: 'Inspection' },
    { id: 'sk_safety_insp', name: 'Safety Inspection', category: 'Inspection' },
    { id: 'sk_roadside', name: 'Roadside Assistance', category: 'Emergency' },
    { id: 'sk_towing', name: 'Towing', category: 'Emergency' },
    { id: 'sk_lockout', name: 'Lockout Service', category: 'Emergency' },
    { id: 'sk_hybrid_ev', name: 'Hybrid & EV Service', category: 'Advanced' },
    { id: 'sk_diesel', name: 'Diesel Engine Service', category: 'Advanced' },
    { id: 'sk_performance', name: 'Performance Upgrades', category: 'Advanced' },
  ];

  for (const skill of skillDefs) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
  }
  console.log(`${skillDefs.length} skills seeded`);
}

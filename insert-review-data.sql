-- Simple script to insert Review data
-- Fix NULL updatedAt first
UPDATE "Mechanic" SET "updatedAt" = COALESCE("updatedAt", "createdAt", CURRENT_TIMESTAMP) WHERE "updatedAt" IS NULL;
UPDATE "Review" SET "updatedAt" = COALESCE("updatedAt", "createdAt", CURRENT_TIMESTAMP) WHERE "updatedAt" IS NULL;

-- Insert Mechanics (skip if exists)
INSERT INTO "Mechanic" ("id", "name", "slug", "bio", "location", "yearsExperience", "rating", "reviewCount", "jobsCompleted", "sinceYear", "certifications", "badges", "isActive", "createdAt", "updatedAt")
VALUES
  ('mech_1', 'Rocco', 'rocco', 'Rocco has been a mechanic for over 20 years. He is an ASE certified Master Technician and has worked on all makes and models of cars. He is passionate about cars and loves to help people. Rocco is a true professional and will always go the extra mile to make sure his customers are happy. He is honest, reliable, and always on time. Rocco is a great choice for all your car repair needs.', 'Los Angeles, CA', 26, 5.0, 303, 1000, 2014, ARRAY['ASE Master Technician']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_2', 'Robert', 'robert', 'Robert is a highly experienced mechanic with over 35 years in the field. Specializing in diagnostics and complex repairs, he is dedicated to providing top-notch service and ensuring customer satisfaction. His extensive knowledge covers a wide range of vehicle makes and models.', 'Los Angeles, CA', 35, 5.0, 675, 800, 2000, ARRAY['ASE Master Technician', 'Hybrid Certified']::TEXT[], ARRAY['Top Rated', 'Expert']::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_3', 'Grzegorz', 'grzegorz', 'Grzegorz brings 45 years of automotive expertise to every job. Known for his meticulous attention to detail and comprehensive understanding of both classic and modern vehicles.', 'Los Angeles, CA', 45, 5.0, 473, 1200, 1979, ARRAY[]::TEXT[], ARRAY['Top Rated', 'Expert']::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_4', 'Mike Johnson', 'mike-johnson', 'Mike is a professional mechanic with extensive experience in engine diagnostics and repairs. He is known for his quick problem-solving skills and excellent customer service.', 'Los Angeles, CA', 15, 5.0, 150, 500, 2009, ARRAY['ASE']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_5', 'David Chen', 'david-chen', 'David specializes in electrical systems and modern vehicle diagnostics. He stays up-to-date with the latest automotive technology and diagnostic tools.', 'San Francisco, CA', 12, 5.0, 200, 600, 2012, ARRAY['ASE']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_6', 'James Wilson', 'james-wilson', 'James is an expert in brake systems and suspension work. He has a reputation for thorough inspections and quality repairs.', 'San Diego, CA', 18, 5.0, 180, 550, 2006, ARRAY['ASE']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_7', 'Robert Martinez', 'robert-martinez', 'Robert specializes in starter and charging system repairs. He is known for his efficient service and fair pricing.', 'Austin, TX', 20, 5.0, 220, 650, 2004, ARRAY['ASE']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_8', 'Thomas Anderson', 'thomas-anderson', 'Thomas is a brake specialist with years of experience in both disc and drum brake systems. He provides reliable and professional service.', 'Phoenix, AZ', 14, 5.0, 160, 480, 2010, ARRAY['ASE']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_9', 'William Brown', 'william-brown', 'William is an experienced mechanic specializing in routine maintenance services. He is known for his friendly demeanor and attention to detail.', 'Seattle, WA', 16, 5.0, 190, 520, 2008, ARRAY['ASE']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_10', 'Richard Taylor', 'richard-taylor', 'Richard is a battery and electrical systems expert. He provides quick and reliable service for all your battery needs.', 'Denver, CO', 13, 5.0, 170, 490, 2011, ARRAY['ASE']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mech_11', 'Joseph White', 'joseph-white', 'Joseph specializes in pre-purchase inspections and comprehensive vehicle diagnostics. He helps customers make informed decisions about vehicle purchases.', 'Miami, FL', 19, 5.0, 210, 580, 2005, ARRAY['ASE']::TEXT[], ARRAY[]::TEXT[], true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert Skills
INSERT INTO "Skill" ("id", "name", "category")
VALUES
  ('skill_1', 'Oil Change', 'Maintenance'),
  ('skill_2', 'Brake Pads Replacement', 'Brakes'),
  ('skill_3', 'Battery Replacement', 'Electrical'),
  ('skill_4', 'Pre-purchase Car Inspection', 'Inspection'),
  ('skill_5', 'Car is not starting Diagnostic', 'Diagnostic'),
  ('skill_6', 'Check Engine Light Diagnostic', 'Diagnostic'),
  ('skill_7', 'Towing and Roadside', 'Emergency'),
  ('skill_8', 'Engine Repair', 'Engine'),
  ('skill_9', 'Transmission Service', 'Transmission'),
  ('skill_10', 'AC Repair', 'HVAC')
ON CONFLICT ("id") DO NOTHING;

-- Insert MechanicSkills
INSERT INTO "MechanicSkill" ("id", "mechanicId", "skillId")
VALUES
  ('ms_1', 'mech_1', 'skill_1'), ('ms_2', 'mech_1', 'skill_2'), ('ms_3', 'mech_1', 'skill_3'), ('ms_4', 'mech_1', 'skill_4'), ('ms_5', 'mech_1', 'skill_5'), ('ms_6', 'mech_1', 'skill_6'),
  ('ms_7', 'mech_2', 'skill_5'), ('ms_8', 'mech_2', 'skill_6'), ('ms_9', 'mech_2', 'skill_8'),
  ('ms_10', 'mech_3', 'skill_1'), ('ms_11', 'mech_3', 'skill_2'), ('ms_12', 'mech_3', 'skill_4'), ('ms_13', 'mech_3', 'skill_8'),
  ('ms_14', 'mech_4', 'skill_5'), ('ms_15', 'mech_4', 'skill_6'), ('ms_16', 'mech_4', 'skill_8'),
  ('ms_17', 'mech_5', 'skill_3'), ('ms_18', 'mech_5', 'skill_5'), ('ms_19', 'mech_5', 'skill_6'),
  ('ms_20', 'mech_6', 'skill_2'), ('ms_21', 'mech_6', 'skill_1'),
  ('ms_22', 'mech_7', 'skill_5'), ('ms_23', 'mech_7', 'skill_3'),
  ('ms_24', 'mech_8', 'skill_2'),
  ('ms_25', 'mech_9', 'skill_1'),
  ('ms_26', 'mech_10', 'skill_3'),
  ('ms_27', 'mech_11', 'skill_4')
ON CONFLICT ("id") DO NOTHING;

-- Insert Reviews
INSERT INTO "Review" ("id", "rating", "reviewerName", "reviewerLocation", "reviewText", "carModel", "carYear", "serviceDescription", "mechanicId", "createdAt", "updatedAt")
VALUES
  ('rev_1', 5, 'John D.', 'Los Angeles, CA', 'Excellent service! Mike was professional, on time, and did a great job fixing my engine noise issue. Highly recommend!', '2007 BMW 335i', 2007, 'Noise from engine or exhaust', 'mech_4', '2024-01-15 14:30:00'::TIMESTAMP, '2024-01-15 14:30:00'::TIMESTAMP),
  ('rev_2', 5, 'Sarah M.', 'San Francisco, CA', 'Power door locks weren''t working and David fixed them quickly. Very satisfied with the service and pricing.', '2020 RAM 1500', 2020, 'Power door locks are not working', 'mech_5', '2024-01-14 11:00:00'::TIMESTAMP, '2024-01-14 11:00:00'::TIMESTAMP),
  ('rev_3', 5, 'Michael R.', 'San Diego, CA', 'Got my brake pads replaced and air filter changed. James was thorough and explained everything clearly. Great experience!', '2019 KIA FORTE', 2019, 'Brake Pads Replacement (Front, Rear) Air Filter', 'mech_6', '2024-01-13 16:15:00'::TIMESTAMP, '2024-01-13 16:15:00'::TIMESTAMP),
  ('rev_4', 5, 'Emily T.', 'Austin, TX', 'My car wouldn''t start and Robert diagnosed and fixed the starter issue. Professional and efficient service.', '2007 NISSAN FRONTIER', 2007, 'Starter', 'mech_7', '2024-01-12 09:30:00'::TIMESTAMP, '2024-01-12 09:30:00'::TIMESTAMP),
  ('rev_5', 5, 'Chris L.', 'Phoenix, AZ', 'Front brake pads replacement was done perfectly. Thomas was on time and the price was fair. Will use again!', '2013 HYUNDAI ELANTRA COUPE', 2013, 'Brake Pads Replacement (Front)', 'mech_8', '2024-01-11 13:45:00'::TIMESTAMP, '2024-01-11 13:45:00'::TIMESTAMP),
  ('rev_6', 5, 'Jessica K.', 'Seattle, WA', 'Oil change service was quick and professional. William was friendly and explained the process. Great value!', '2018 HONDA CIVIC', 2018, 'Oil Change', 'mech_9', '2024-01-10 15:20:00'::TIMESTAMP, '2024-01-10 15:20:00'::TIMESTAMP),
  ('rev_7', 5, 'Daniel P.', 'Denver, CO', 'Battery replacement was done in my driveway. Richard was knowledgeable and the service was completed quickly.', '2015 TOYOTA CAMRY', 2015, 'Battery Replacement', 'mech_10', '2024-01-09 10:15:00'::TIMESTAMP, '2024-01-09 10:15:00'::TIMESTAMP),
  ('rev_8', 5, 'Amanda H.', 'Miami, FL', 'Pre-purchase inspection helped me make an informed decision. Joseph was thorough and provided a detailed report.', '2017 FORD F-150', 2017, 'Pre-purchase Car Inspection', 'mech_11', '2024-01-08 14:00:00'::TIMESTAMP, '2024-01-08 14:00:00'::TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Update mechanic ratings and review counts
UPDATE "Mechanic" SET 
  "rating" = COALESCE((SELECT AVG("rating")::float FROM "Review" WHERE "Review"."mechanicId" = "Mechanic"."id"), "rating"),
  "reviewCount" = COALESCE((SELECT COUNT(*) FROM "Review" WHERE "Review"."mechanicId" = "Mechanic"."id"), "reviewCount");





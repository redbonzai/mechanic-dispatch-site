import { PrismaClient } from '@prisma/client';
import { DAILY_DRIVER_MAKES } from '../data/daily-driver-makes';
import { toSlug } from '../lib/to-slug';

const START_YEAR = 2000;
const END_YEAR = new Date().getFullYear() + 1;

interface NhtsaMake {
  Make_ID: number;
  Make_Name: string;
}

interface NhtsaModel {
  Model_ID: number;
  Model_Name: string;
}

function isWhitelistedMakeName(name: string): boolean {
  const n = name.trim().toLowerCase();
  return DAILY_DRIVER_MAKES.some((m) => m.toLowerCase() === n);
}

async function fetchAllMakes(): Promise<NhtsaMake[]> {
  const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json');
  if (!res.ok) {
    throw new Error(`NHTSA GetAllMakes failed: ${res.status}`);
  }
  const data = (await res.json()) as { Results?: NhtsaMake[] };
  return data.Results ?? [];
}

async function fetchModelsForMakeYear(make: string, year: number): Promise<NhtsaModel[]> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { Results?: NhtsaModel[] };
  return data.Results ?? [];
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function seedMakesOnly(prisma: PrismaClient): Promise<void> {
  for (const name of DAILY_DRIVER_MAKES) {
    await prisma.vehicleMakeCatalog.upsert({
      where: { slug: toSlug(name) },
      update: {
        name,
        isActive: true,
        isDailyDriver: true,
        source: 'internal-whitelist',
      },
      create: {
        name,
        slug: toSlug(name),
        isActive: true,
        isDailyDriver: true,
        source: 'internal-whitelist',
      },
    });
  }
}

/**
 * By default upserts whitelist makes only (fast for Docker/local).
 * Set FULL_VEHICLE_CATALOG_NHTSA=true for full NHTSA make/model/year sync (slow; hundreds of HTTP calls).
 */
export async function seedVehicleCatalog(prisma: PrismaClient): Promise<void> {
  if (process.env.FULL_VEHICLE_CATALOG_NHTSA !== 'true') {
    console.log(
      'Seeding vehicle catalog (whitelist makes only). Set FULL_VEHICLE_CATALOG_NHTSA=true for full NHTSA sync.',
    );
    await seedMakesOnly(prisma);
    console.log('Vehicle makes seeded');
    return;
  }

  console.log(`Seeding vehicle catalog from NHTSA (${START_YEAR}–${END_YEAR})...`);
  const pauseMs = Number(process.env.VEHICLE_CATALOG_REQUEST_DELAY_MS ?? '0') || 0;

  const allMakes = await fetchAllMakes();
  const approvedMakes = allMakes.filter((m) => isWhitelistedMakeName(m.Make_Name));

  for (const make of approvedMakes) {
    const makeRow = await prisma.vehicleMakeCatalog.upsert({
      where: { slug: toSlug(make.Make_Name) },
      update: {
        name: make.Make_Name,
        isActive: true,
        isDailyDriver: true,
        source: 'NHTSA',
      },
      create: {
        name: make.Make_Name,
        slug: toSlug(make.Make_Name),
        isActive: true,
        isDailyDriver: true,
        source: 'NHTSA',
      },
    });

    for (let year = START_YEAR; year <= END_YEAR; year++) {
      if (pauseMs > 0) await delay(pauseMs);
      const models = await fetchModelsForMakeYear(make.Make_Name, year);

      for (const model of models) {
        const modelRow = await prisma.vehicleModelCatalog.upsert({
          where: {
            makeId_slug: {
              makeId: makeRow.id,
              slug: toSlug(model.Model_Name),
            },
          },
          update: {
            name: model.Model_Name,
            isActive: true,
          },
          create: {
            makeId: makeRow.id,
            name: model.Model_Name,
            slug: toSlug(model.Model_Name),
            isActive: true,
          },
        });

        await prisma.vehicleYearCatalog.upsert({
          where: {
            modelId_year: {
              modelId: modelRow.id,
              year,
            },
          },
          update: {},
          create: {
            modelId: modelRow.id,
            year,
          },
        });
      }
    }
  }

  console.log('Vehicle catalog seeded');
}

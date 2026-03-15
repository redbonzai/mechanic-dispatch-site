import { Injectable, Logger } from '@nestjs/common';
import {
  NhtsaRecall,
  VehicleDecodeResult,
} from '../interfaces/repair-data.interface';

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api';
const NHTSA_RECALLS_BASE = 'https://api.nhtsa.gov/recalls';

/** TTL constants in milliseconds */
const TTL_MAKES = 24 * 60 * 60 * 1000;      // 24 h — makes list rarely changes
const TTL_MODELS = 24 * 60 * 60 * 1000;     // 24 h — models for make/year
const TTL_VIN = 60 * 60 * 1000;             // 1 h  — VIN decode
const TTL_RECALLS = 4 * 60 * 60 * 1000;     // 4 h  — recall data

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

@Injectable()
export class NhtsaService {
  private readonly logger = new Logger(NhtsaService.name);

  // Separate caches per resource type so TTLs can differ
  private readonly makesCache = new TtlCache<Array<{ makeId: number; makeName: string }>>();
  private readonly modelsCache = new TtlCache<Array<{ modelId: number; modelName: string }>>();
  private readonly vinCache = new TtlCache<VehicleDecodeResult | null>();
  private readonly recallsCache = new TtlCache<NhtsaRecall[]>();

  async getAllMakes(): Promise<Array<{ makeId: number; makeName: string }>> {
    const cached = this.makesCache.get('all');
    if (cached) return cached;

    try {
      const response = await fetch(
        `${NHTSA_BASE}/vehicles/GetAllMakes?format=json`,
        { signal: AbortSignal.timeout(10000) },
      );
      const data = (await response.json()) as NhtsaMakesResponse;
      const result = (data.Results ?? []).map((r) => ({
        makeId: r.Make_ID,
        makeName: r.Make_Name,
      }));
      this.makesCache.set('all', result, TTL_MAKES);
      return result;
    } catch (error) {
      this.logger.error('NHTSA GetAllMakes failed', error);
      return [];
    }
  }

  async getModelsForMakeYear(
    make: string,
    year: number,
  ): Promise<Array<{ modelId: number; modelName: string }>> {
    const cacheKey = `${make.toLowerCase()}:${year}`;
    const cached = this.modelsCache.get(cacheKey);
    if (cached) return cached;

    try {
      const url = `${NHTSA_BASE}/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = (await response.json()) as NhtsaModelsResponse;
      const result = (data.Results ?? []).map((r) => ({
        modelId: r.Model_ID,
        modelName: r.Model_Name,
      }));
      this.modelsCache.set(cacheKey, result, TTL_MODELS);
      return result;
    } catch (error) {
      this.logger.error('NHTSA GetModelsForMakeYear failed', error);
      return [];
    }
  }

  async decodeVin(vin: string): Promise<VehicleDecodeResult | null> {
    const cacheKey = vin.toUpperCase();
    const cached = this.vinCache.get(cacheKey);
    if (cached !== undefined) return cached;

    try {
      const url = `${NHTSA_BASE}/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const data = (await response.json()) as NhtsaVinResponse;

      const raw = data.Results?.[0];
      if (!raw || raw.ErrorCode !== '0') {
        this.vinCache.set(cacheKey, null, TTL_VIN);
        return null;
      }

      const result: VehicleDecodeResult = {
        make: raw.Make,
        model: raw.Model,
        year: parseInt(raw.ModelYear, 10),
        trim: raw.Trim || undefined,
        engine: raw.DisplacementL
          ? `${raw.DisplacementL}L ${raw.EngineConfiguration} ${raw.FuelTypePrimary}`
          : undefined,
        transmission: raw.TransmissionStyle || undefined,
        bodyStyle: raw.BodyClass || undefined,
        driveType: raw.DriveType || undefined,
        fuelType: raw.FuelTypePrimary || undefined,
      };
      this.vinCache.set(cacheKey, result, TTL_VIN);
      return result;
    } catch (error) {
      this.logger.error('NHTSA DecodeVin failed', error);
      return null;
    }
  }

  async getRecallsByVehicle(
    make: string,
    model: string,
    year: number,
  ): Promise<NhtsaRecall[]> {
    const cacheKey = `${make.toLowerCase()}:${model.toLowerCase()}:${year}`;
    const cached = this.recallsCache.get(cacheKey);
    if (cached) return cached;

    try {
      const url = `${NHTSA_RECALLS_BASE}/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = (await response.json()) as NhtsaRecallsResponse;
      const result = this.mapRecalls(data.results ?? []);
      this.recallsCache.set(cacheKey, result, TTL_RECALLS);
      return result;
    } catch (error) {
      this.logger.error('NHTSA recalls lookup failed', error);
      return [];
    }
  }

  async getRecallsByVin(vin: string): Promise<NhtsaRecall[]> {
    const cacheKey = `vin:${vin.toUpperCase()}`;
    const cached = this.recallsCache.get(cacheKey);
    if (cached) return cached;

    try {
      const url = `${NHTSA_RECALLS_BASE}/recallsByVehicle?vin=${encodeURIComponent(vin)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = (await response.json()) as NhtsaRecallsResponse;
      const result = this.mapRecalls(data.results ?? []);
      this.recallsCache.set(cacheKey, result, TTL_RECALLS);
      return result;
    } catch (error) {
      this.logger.error('NHTSA VIN recall lookup failed', error);
      return [];
    }
  }

  private mapRecalls(
    raw: NhtsaRecallsResponse['results'],
  ): NhtsaRecall[] {
    return raw.map((r) => ({
      recallId: r.NHTSACampaignNumber,
      campaignNumber: r.NHTSACampaignNumber,
      reportReceivedDate: r.ReportReceivedDate,
      component: r.Component,
      summary: r.Summary,
      consequence: r.Consequence,
      remedy: r.Remedy,
    }));
  }
}

// NHTSA API response shapes
interface NhtsaMakesResponse {
  Results: Array<{ Make_ID: number; Make_Name: string }>;
}

interface NhtsaModelsResponse {
  Results: Array<{ Model_ID: number; Model_Name: string }>;
}

interface NhtsaVinResponse {
  Results: Array<{
    ErrorCode: string;
    Make: string;
    Model: string;
    ModelYear: string;
    Trim: string;
    DisplacementL: string;
    EngineConfiguration: string;
    FuelTypePrimary: string;
    TransmissionStyle: string;
    BodyClass: string;
    DriveType: string;
  }>;
}

interface NhtsaRecallsResponse {
  results: Array<{
    NHTSACampaignNumber: string;
    ReportReceivedDate: string;
    Component: string;
    Summary: string;
    Consequence: string;
    Remedy: string;
  }>;
}

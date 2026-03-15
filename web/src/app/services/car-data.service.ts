import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CarMake {
  makeId: number;
  makeName: string;
}

export interface CarModel {
  modelId: number;
  modelName: string;
}

export interface VehicleDecodeResult {
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  bodyStyle?: string;
  driveType?: string;
  fuelType?: string;
}

@Injectable({ providedIn: 'root' })
export class CarDataService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAllMakes() {
    return this.http.get<CarMake[]>(`${this.apiUrl}/cars/makes`);
  }

  getModelsForMakeYear(make: string, year: number) {
    return this.http.get<CarModel[]>(
      `${this.apiUrl}/cars/makes/${encodeURIComponent(make)}/models/${year}`,
    );
  }

  decodeVin(vin: string) {
    return this.http.get<VehicleDecodeResult | null>(
      `${this.apiUrl}/cars/decode-vin/${encodeURIComponent(vin)}`,
    );
  }
}

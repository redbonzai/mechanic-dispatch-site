import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserAuthService } from '../../services/user-auth.service';
import { CarDataService } from '../../services/car-data.service';
import { Vehicle } from '../../models/auth.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  vehicles = signal<Vehicle[]>([]);
  addingVehicle = signal(false);
  loadingVin = signal(false);

  newVehicle = { make: '', model: '', year: new Date().getFullYear(), trim: '', vin: '', licensePlate: '', plateState: '', notes: '' };
  readonly currentYear = new Date().getFullYear();
  readonly years = Array.from({ length: 35 }, (_, i) => this.currentYear - i);

  constructor(
    readonly userAuth: UserAuthService,
    private readonly http: HttpClient,
    private readonly carData: CarDataService,
  ) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.http.get<Vehicle[]>(`${environment.apiUrl}/users/me/vehicles`).subscribe({
      next: (v) => this.vehicles.set(v),
    });
  }

  decodeVin() {
    const vin = this.newVehicle.vin.trim();
    if (vin.length !== 17) return;
    this.loadingVin.set(true);
    this.carData.decodeVin(vin).subscribe({
      next: (res) => {
        if (res) {
          this.newVehicle.make = res.make;
          this.newVehicle.model = res.model;
          this.newVehicle.year = res.year;
          this.newVehicle.trim = res.trim ?? '';
        }
        this.loadingVin.set(false);
      },
      error: () => this.loadingVin.set(false),
    });
  }

  addVehicle() {
    this.http.post<Vehicle>(`${environment.apiUrl}/users/me/vehicles`, this.newVehicle).subscribe({
      next: (v) => {
        this.vehicles.update((list) => [...list, v]);
        this.addingVehicle.set(false);
        this.resetVehicleForm();
      },
    });
  }

  removeVehicle(id: string) {
    this.http.delete(`${environment.apiUrl}/users/me/vehicles/${id}`).subscribe({
      next: () => this.vehicles.update((list) => list.filter((v) => v.id !== id)),
    });
  }

  resendVerification() {
    this.http
      .post(`${environment.apiUrl}/auth/users/resend-verification`, {})
      .subscribe({ error: () => null });
  }

  private resetVehicleForm() {
    this.newVehicle = { make: '', model: '', year: this.currentYear, trim: '', vin: '', licensePlate: '', plateState: '', notes: '' };
  }
}

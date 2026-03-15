import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User, UserAuthResponse, Vehicle } from '../models/auth.models';
import { environment } from '../../environments/environment';

const USER_TOKEN_KEY = 'user_access_token';
const USER_REFRESH_KEY = 'user_refresh_token';
const SEARCH_COUNT_KEY = 'anon_search_count';
const SEARCH_PROMPT_THRESHOLD = 3;
const SEARCH_VEHICLE_KEY = 'search_vehicle';

export interface SearchVehicle {
  make: string;
  model: string;
  year: string;
}

@Injectable({ providedIn: 'root' })
export class UserAuthService {
  private readonly apiUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);

  /** Persisted make/model/year used across all search entry points */
  searchVehicle = signal<SearchVehicle>(this.loadSearchVehicle());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = this.getAccessToken();
    if (token) {
      this.fetchProfile().subscribe({
        error: () => this.clearTokens(),
      });
    }
  }

  register(data: { email: string; name: string; password: string }) {
    return this.http
      .post<UserAuthResponse>(`${this.apiUrl}/auth/users/register`, data)
      .pipe(tap((res) => this.storeSession(res)));
  }

  login(data: { email: string; password: string }) {
    return this.http
      .post<UserAuthResponse>(`${this.apiUrl}/auth/users/login`, data)
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout() {
    this.http
      .post(`${this.apiUrl}/auth/users/logout`, {})
      .subscribe({ error: () => null });
    this.clearTokens();
    void this.router.navigate(['/']);
  }

  fetchProfile() {
    return this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      }),
    );
  }

  /** Fetch the user's vehicles and pre-fill searchVehicle from the first one if nothing is saved */
  prefillSearchVehicleFromProfile() {
    const current = this.searchVehicle();
    if (current.make || current.year) return; // already set by the user
    this.http.get<Vehicle[]>(`${this.apiUrl}/users/me/vehicles`).subscribe({
      next: (vehicles) => {
        if (vehicles.length > 0) {
          const v = vehicles[0];
          this.setSearchVehicle({
            make: v.make,
            model: v.model,
            year: String(v.year),
          });
        }
      },
      error: () => null,
    });
  }

  setSearchVehicle(v: Partial<SearchVehicle>) {
    const updated = { ...this.searchVehicle(), ...v };
    this.searchVehicle.set(updated);
    localStorage.setItem(SEARCH_VEHICLE_KEY, JSON.stringify(updated));
  }

  private loadSearchVehicle(): SearchVehicle {
    try {
      const stored = localStorage.getItem(SEARCH_VEHICLE_KEY);
      return stored ? (JSON.parse(stored) as SearchVehicle) : { make: '', model: '', year: '' };
    } catch {
      return { make: '', model: '', year: '' };
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(USER_TOKEN_KEY);
  }

  /** Returns true if the user should be prompted to register */
  incrementAnonSearchCount(): boolean {
    if (this.isLoggedIn()) return false;
    const count =
      parseInt(localStorage.getItem(SEARCH_COUNT_KEY) ?? '0', 10) + 1;
    localStorage.setItem(SEARCH_COUNT_KEY, String(count));
    return count >= SEARCH_PROMPT_THRESHOLD;
  }

  getAnonSearchCount(): number {
    return parseInt(localStorage.getItem(SEARCH_COUNT_KEY) ?? '0', 10);
  }

  clearAnonSearchCount() {
    localStorage.removeItem(SEARCH_COUNT_KEY);
  }

  private storeSession(res: UserAuthResponse) {
    localStorage.setItem(USER_TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_REFRESH_KEY, res.refreshToken);
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
    this.clearAnonSearchCount();
    // Attempt to pre-fill search vehicle from registered vehicles (non-blocking)
    setTimeout(() => this.prefillSearchVehicleFromProfile(), 0);
  }

  private clearTokens() {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_REFRESH_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }
}

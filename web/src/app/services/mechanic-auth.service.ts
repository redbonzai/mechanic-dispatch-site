import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Mechanic, MechanicAuthResponse } from '../models/auth.models';
import { environment } from '../../environments/environment';

const MECH_TOKEN_KEY = 'mech_access_token';
const MECH_REFRESH_KEY = 'mech_refresh_token';

@Injectable({ providedIn: 'root' })
export class MechanicAuthService {
  private readonly apiUrl = environment.apiUrl;

  currentMechanic = signal<Mechanic | null>(null);
  isLoggedIn = signal(false);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = this.getAccessToken();
    if (token) {
      this.fetchProfile().subscribe({ error: () => this.clearTokens() });
    }
  }

  register(data: {
    email: string;
    password: string;
    name: string;
    location: string;
    shopName?: string;
    phone?: string;
    website?: string;
    bio?: string;
    yearsExperience: number;
    certifications?: string[];
    skillIds?: string[];
  }) {
    return this.http
      .post<MechanicAuthResponse>(`${this.apiUrl}/auth/mechanics/register`, data)
      .pipe(tap((res) => this.storeSession(res)));
  }

  login(data: { email: string; password: string }) {
    return this.http
      .post<MechanicAuthResponse>(`${this.apiUrl}/auth/mechanics/login`, data)
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout() {
    this.http
      .post(`${this.apiUrl}/auth/mechanics/logout`, {})
      .subscribe({ error: () => null });
    this.clearTokens();
    void this.router.navigate(['/']);
  }

  fetchProfile() {
    return this.http.get<Mechanic>(`${this.apiUrl}/auth/mechanics/me`).pipe(
      tap((m) => {
        this.currentMechanic.set(m);
        this.isLoggedIn.set(true);
      }),
    );
  }

  updateProfile(data: Partial<Mechanic> & { skillIds?: string[] }) {
    return this.http
      .patch<Mechanic>(`${this.apiUrl}/auth/mechanics/me`, data)
      .pipe(tap((m) => this.currentMechanic.set(m)));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(MECH_TOKEN_KEY);
  }

  private storeSession(res: MechanicAuthResponse) {
    localStorage.setItem(MECH_TOKEN_KEY, res.accessToken);
    localStorage.setItem(MECH_REFRESH_KEY, res.refreshToken);
    this.currentMechanic.set(res.mechanic);
    this.isLoggedIn.set(true);
  }

  private clearTokens() {
    localStorage.removeItem(MECH_TOKEN_KEY);
    localStorage.removeItem(MECH_REFRESH_KEY);
    this.currentMechanic.set(null);
    this.isLoggedIn.set(false);
  }
}

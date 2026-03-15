import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-page">
      <div class="verify-card">
        @if (status() === 'loading') {
          <div class="spinner"></div>
          <p>Verifying your email…</p>
        }
        @if (status() === 'success') {
          <div class="icon success">✓</div>
          <h1>Email verified!</h1>
          <p>Your account is now active. You can start searching for fixes or exploring mechanics.</p>
          <a routerLink="/" class="btn">Go to FixGuide →</a>
        }
        @if (status() === 'error') {
          <div class="icon error">✕</div>
          <h1>Verification failed</h1>
          <p>{{ errorMsg() }}</p>
          <a routerLink="/" class="btn btn--ghost">Back to home</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .verify-page {
      min-height: 100vh; background: #f8fafc;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .verify-card {
      background: #fff; border-radius: 20px; padding: 48px 40px;
      text-align: center; max-width: 420px; width: 100%;
      box-shadow: 0 8px 40px rgba(15,23,42,.08);
    }
    .icon {
      width: 64px; height: 64px; border-radius: 50%;
      font-size: 28px; font-weight: 800; display: flex;
      align-items: center; justify-content: center; margin: 0 auto 20px;
      &.success { background: #10b981; color: #fff; }
      &.error { background: #ef4444; color: #fff; }
    }
    h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e2e8f0;
      border-top-color: #2563eb; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn {
      display: inline-block; background: #2563eb; color: #fff;
      padding: 12px 28px; border-radius: 10px; font-weight: 700;
      font-size: 14px; text-decoration: none;
    }
    .btn--ghost { background: #f1f5f9; color: #475569; }
  `],
})
export class VerifyEmailComponent implements OnInit {
  status = signal<'loading' | 'success' | 'error'>('loading');
  errorMsg = signal('This verification link is invalid or has expired.');

  // Detect mechanic flow via query param ?type=mechanic
  private isMechanic = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.isMechanic = this.route.snapshot.queryParamMap.get('type') === 'mechanic';

    if (!token) {
      this.status.set('error');
      return;
    }

    const endpoint = this.isMechanic
      ? `${environment.apiUrl}/auth/mechanics/verify-email`
      : `${environment.apiUrl}/auth/users/verify-email`;

    this.http.get(endpoint, { params: { token } }).subscribe({
      next: () => this.status.set('success'),
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? 'Verification failed. Please try again.');
        this.status.set('error');
      },
    });
  }
}

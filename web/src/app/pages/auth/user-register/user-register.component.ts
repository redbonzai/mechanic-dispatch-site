import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserAuthService } from '../../../services/user-auth.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card__icon">🔍</div>
        <h1>Create your free account</h1>
        <p class="auth-card__sub">Save your searches, manage your vehicles, and get personalized repair results.</p>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()" #form="ngForm">
          <div class="field">
            <label>Your name</label>
            <input type="text" [(ngModel)]="name" name="name" required placeholder="Jane Smith" />
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="jane@example.com" />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="8" placeholder="Minimum 8 characters" />
          </div>
          <button type="submit" class="submit-btn" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Create free account' }}
          </button>
        </form>

        <p class="auth-card__footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
        <p class="auth-card__mechanic">
          Are you a mechanic? <a routerLink="/mechanic-register">List your services →</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #f8fafc;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      background: #fff;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 40px rgba(15,23,42,0.1);
      text-align: center;
    }
    .auth-card h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
    .auth-card__icon { font-size: 40px; margin-bottom: 12px; }
    .auth-card__sub { color: #64748b; font-size: 14px; margin: 0 0 28px; line-height: 1.5; }
    .auth-card__footer { font-size: 13px; color: #64748b; margin-top: 16px; }
    .auth-card__footer a { color: #2563eb; }
    .auth-card__mechanic { font-size: 13px; color: #94a3b8; margin-top: 8px; }
    .auth-card__mechanic a { color: #059669; }
    .field {
      text-align: left;
      margin-bottom: 16px;
    }
    .field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .field input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s;
    }
    .field input:focus { border-color: #2563eb; }
    .submit-btn {
      width: 100%;
      padding: 12px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.15s;
    }
    .submit-btn:hover:not(:disabled) { background: #3b82f6; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-error {
      background: #fef2f2;
      color: #dc2626;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 16px;
    }
  `],
})
export class UserRegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private readonly authService: UserAuthService,
    private readonly router: Router,
  ) {}

  submit() {
    this.loading.set(true);
    this.error.set('');

    this.authService
      .register({ name: this.name, email: this.email, password: this.password })
      .subscribe({
        next: () => void this.router.navigate(['/profile']),
        error: (err) => {
          this.error.set(
            err?.error?.message ?? 'Registration failed. Please try again.',
          );
          this.loading.set(false);
        },
      });
  }
}

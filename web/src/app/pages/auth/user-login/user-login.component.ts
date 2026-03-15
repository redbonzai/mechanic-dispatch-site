import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserAuthService } from '../../../services/user-auth.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Sign in</h1>
        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }
        <form (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com" />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="Your password" />
          </div>
          <button type="submit" class="submit-btn" [disabled]="loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
        <p class="auth-footer">No account? <a routerLink="/register">Create one free →</a></p>
        <p class="auth-footer">Mechanic? <a routerLink="/mechanic-login">Sign in here →</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: #f8fafc; }
    .auth-card { width: 100%; max-width: 380px; background: #fff; border-radius: 20px; padding: 40px; box-shadow: 0 8px 40px rgba(15,23,42,0.1); h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 24px; text-align: center; } }
    .field { margin-bottom: 16px; label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; } input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.15s; &:focus { border-color: #2563eb; } } }
    .submit-btn { width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: background 0.15s; &:hover:not(:disabled) { background: #3b82f6; } &:disabled { opacity: 0.6; cursor: not-allowed; } }
    .auth-error { background: #fef2f2; color: #dc2626; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }
    .auth-footer { font-size: 13px; color: #64748b; text-align: center; margin-top: 12px; a { color: #2563eb; } }
  `],
})
export class UserLoginComponent {
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

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => void this.router.navigate(['/profile']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Invalid email or password.');
        this.loading.set(false);
      },
    });
  }
}

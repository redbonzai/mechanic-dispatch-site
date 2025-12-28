/**
 * LoginComponent
 * 
 * Admin login form with reactive forms validation.
 * Handles authentication flow and navigation.
 * 
 * @authority docs/admin/SECURITY_REQUIREMENTS.md
 * @authority docs/admin/API_CONTRACTS.md
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  private returnUrl: string = '/admin/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AdminAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
  }

  /**
   * Handle login form submission
   */
  onSubmit(): void {
    // Reset error state
    this.error = null;

    // Validate form
    if (this.loginForm.invalid) {
      return;
    }

    // Set loading state
    this.loading = true;
    this.loginForm.disable();

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.loading = false;
        this.loginForm.enable();
        this.error = err?.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  /**
   * Check if a form field has an error
   * 
   * @param fieldName - Name of the form field
   * @returns True if field is invalid and touched
   */
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get error message for a form field
   * 
   * @param fieldName - Name of the form field
   * @returns Error message or empty string
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.capitalizeFirst(fieldName)} is required`;
    }

    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Password must be at least ${minLength} characters`;
    }

    return '';
  }

  /**
   * Capitalize first letter of string
   * 
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

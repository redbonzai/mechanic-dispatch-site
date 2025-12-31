import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminUsersService } from '../../services/admin-users.service';
import { AdminRole } from '../../models/admin-user.model';

/**
 * UserCreateComponent
 *
 * Form for creating new admin users.
 * Features:
 * - Form validation (email, password, required fields)
 * - Role selection dropdown
 * - Active/inactive toggle
 * - Navigate back on cancel or success
 * - Error handling with user feedback
 */
@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
})
export class UserCreateComponent {
  createForm: FormGroup;
  submitting = signal<boolean>(false);
  error = signal<string | null>(null);

  roleOptions: AdminRole[] = ['super-admin', 'admin', 'moderator'];

  constructor(
    private fb: FormBuilder,
    private adminUsersService: AdminUsersService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['admin', Validators.required],
      isActive: [true],
    });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.createForm.value;

    this.adminUsersService.createUser(formValue).subscribe({
      next: (user) => {
        this.submitting.set(false);
        // Navigate to the created user's detail page
        this.router.navigate(['/admin/users', user.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to create user');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }

  private markAllAsTouched(): void {
    Object.keys(this.createForm.controls).forEach((key) => {
      this.createForm.get(key)?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.createForm.get(fieldName);

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
      return `${this.capitalizeFirst(fieldName)} must be at least ${minLength} characters`;
    }

    return '';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

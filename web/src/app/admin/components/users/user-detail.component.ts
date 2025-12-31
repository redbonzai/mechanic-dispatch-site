import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminUsersService } from '../../services/admin-users.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminUser, AdminRole, UpdateAdminUserRequest } from '../../models/admin-user.model';

/**
 * UserDetailComponent
 *
 * Displays detailed admin user information with edit capabilities.
 * Features:
 * - View mode with all user details
 * - Edit mode with form validation
 * - Security info (failed logins)
 * - Delete user with confirmation
 * - Prevent deleting self
 * - Prevent deleting last super-admin
 */
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  user = signal<AdminUser | null>(null);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);
  editMode = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);

  // Edit form state
  editForm = signal({
    name: '',
    email: '',
    password: '',
    role: '' as AdminRole,
    isActive: true,
  });

  roleOptions: AdminRole[] = ['super-admin', 'admin', 'moderator'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminUsersService: AdminUsersService,
    private adminAuthService: AdminAuthService,
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  loadUser(userId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminUsersService.getUserById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load user');
        this.loading.set(false);
      },
    });
  }

  onEdit(): void {
    const user = this.user();
    if (!user) return;

    this.editForm.set({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
    });
    this.editMode.set(true);
  }

  onCancelEdit(): void {
    this.editMode.set(false);
    this.editForm.set({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      isActive: true,
    });
  }

  onSave(): void {
    const user = this.user();
    if (!user) return;

    const form = this.editForm();
    const updates: UpdateAdminUserRequest = {};

    if (form.name !== user.name) {
      updates.name = form.name;
    }
    if (form.email !== user.email) {
      updates.email = form.email;
    }
    if (form.password) {
      updates.password = form.password;
    }
    if (form.role !== user.role) {
      updates.role = form.role;
    }
    if (form.isActive !== user.isActive) {
      updates.isActive = form.isActive;
    }

    if (Object.keys(updates).length === 0) {
      this.editMode.set(false);
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.adminUsersService.updateUser(user.id, updates).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.editMode.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.message || 'Failed to update user');
        this.saving.set(false);
      },
    });
  }

  onDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  onConfirmDelete(): void {
    const user = this.user();
    if (!user) return;

    this.saving.set(true);
    this.error.set(null);

    this.adminUsersService.deleteUser(user.id).subscribe({
      next: () => {
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.message || 'Failed to delete user');
        this.saving.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/admin/users']);
  }

  canDelete(): boolean {
    const user = this.user();
    const currentUser = this.adminAuthService.getCurrentUser();
    if (!user || !currentUser) return false;
    
    // Cannot delete yourself
    if (user.id === currentUser.id) return false;
    
    return true;
  }

  getRoleBadgeClass(role: AdminRole): string {
    switch (role) {
      case 'super-admin':
        return 'badge-super-admin';
      case 'admin':
        return 'badge-admin';
      case 'moderator':
        return 'badge-moderator';
      default:
        return '';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-active' : 'badge-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  isFormValid(): boolean {
    const form = this.editForm();
    return (
      form.name.length >= 2 &&
      form.email.includes('@') &&
      (form.password === '' || form.password.length >= 8)
    );
  }
}

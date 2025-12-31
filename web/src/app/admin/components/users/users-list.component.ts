import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminUsersService } from '../../services/admin-users.service';
import {
  AdminUserListItem,
  AdminUserListResponse,
  AdminRole,
} from '../../models/admin-user.model';

/**
 * UsersListComponent
 *
 * Displays paginated list of admin users with filtering and sorting.
 * Features:
 * - Role filter (super-admin, admin, moderator)
 * - Active/inactive filter
 * - Search by name or email
 * - Pagination controls
 * - Sortable columns
 * - Role and status badges
 */
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  // Signals for reactive state
  users = signal<AdminUserListItem[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Pagination state
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);
  hasNext = signal<boolean>(false);
  hasPrev = signal<boolean>(false);

  // Filter state
  roleFilter = signal<AdminRole | ''>('');
  activeFilter = signal<boolean | ''>('');
  searchQuery = signal<string>('');

  // Sort state
  sortBy = signal<'createdAt' | 'updatedAt' | 'name' | 'email'>('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Role options for dropdown
  roleOptions: { value: AdminRole | ''; label: string }[] = [
    { value: '', label: 'All Roles' },
    { value: 'super-admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
  ];

  // Active filter options
  activeOptions = [
    { value: '', label: 'All Status' },
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
  ];

  constructor(
    private adminUsersService: AdminUsersService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    };

    if (this.roleFilter()) {
      params.role = this.roleFilter();
    }

    if (this.activeFilter() !== '') {
      params.isActive = this.activeFilter();
    }

    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }

    this.adminUsersService.getUsers(params).subscribe({
      next: (response: AdminUserListResponse) => {
        this.users.set(response.items);
        this.currentPage.set(response.pagination.page);
        this.pageSize.set(response.pagination.limit);
        this.totalItems.set(response.pagination.total);
        this.totalPages.set(response.pagination.totalPages);
        this.hasNext.set(response.pagination.hasNext);
        this.hasPrev.set(response.pagination.hasPrev);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load users');
        this.loading.set(false);
      },
    });
  }

  onRoleFilterChange(role: AdminRole | ''): void {
    this.roleFilter.set(role);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onActiveFilterChange(active: boolean | ''): void {
    this.activeFilter.set(active);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onSearchChange(search: string): void {
    this.searchQuery.set(search);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onSort(column: 'createdAt' | 'updatedAt' | 'name' | 'email'): void {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('asc');
    }
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onCreateUser(): void {
    this.router.navigate(['/admin/users/create']);
  }

  onUserClick(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
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

  getSortIcon(column: string): string {
    if (this.sortBy() !== column) {
      return '↕';
    }
    return this.sortOrder() === 'asc' ? '↑' : '↓';
  }
}

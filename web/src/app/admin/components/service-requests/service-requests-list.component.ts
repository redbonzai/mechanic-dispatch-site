import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceRequestsService } from '../../services/service-requests.service';
import {
  AdminServiceRequestListItem,
  ServiceRequestListQuery,
  ServiceRequestListResponse,
} from '../../models/service-request.model';

@Component({
  selector: 'app-service-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-requests-list.component.html',
  styleUrls: ['./service-requests-list.component.scss'],
})
export class ServiceRequestsListComponent implements OnInit {
  readonly Math = Math;
  requests = signal<AdminServiceRequestListItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalRequests = signal(0);
  totalPages = signal(0);

  // Filters
  statusFilter = signal<string>('');
  searchQuery = signal<string>('');
  startDateFilter = signal<string>('');
  endDateFilter = signal<string>('');
  sortBy = signal<string>('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  readonly statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'AUTHORIZED', label: 'Authorized' },
    { value: 'CAPTURED', label: 'Captured' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'FINALIZED', label: 'Finalized' },
  ];

  constructor(
    private serviceRequestsService: ServiceRequestsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);

    const query = this.buildQuery();

    this.serviceRequestsService.list(query).subscribe({
      next: (response: ServiceRequestListResponse) => {
        this.requests.set(response.items);
        this.totalRequests.set(response.pagination.total);
        this.totalPages.set(response.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load service requests');
        this.loading.set(false);
        console.error('Error loading service requests:', err);
      },
    });
  }

  private buildQuery(): ServiceRequestListQuery {
    const query: ServiceRequestListQuery = {
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: this.sortBy() as 'createdAt' | 'updatedAt' | 'status' | 'amountCents',
      sortOrder: this.sortOrder(),
    };

    if (this.statusFilter()) {
      query.status = this.statusFilter() as any;
    }

    if (this.searchQuery()) {
      query.search = this.searchQuery();
    }

    if (this.startDateFilter()) {
      query.startDate = this.startDateFilter();
    }

    if (this.endDateFilter()) {
      query.endDate = this.endDateFilter();
    }

    return query;
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadRequests();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadRequests();
    }
  }

  onSort(column: string): void {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('desc');
    }
    this.loadRequests();
  }

  viewDetails(id: string): void {
    this.router.navigate(['/admin/service-requests', id]);
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'status-pending',
      AUTHORIZED: 'status-authorized',
      CAPTURED: 'status-captured',
      CANCELLED: 'status-cancelled',
      FAILED: 'status-failed',
      FINALIZED: 'status-finalized',
    };
    return statusMap[status] || '';
  }

  formatDate(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  clearFilters(): void {
    this.statusFilter.set('');
    this.searchQuery.set('');
    this.startDateFilter.set('');
    this.endDateFilter.set('');
    this.currentPage.set(1);
    this.loadRequests();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.statusFilter() ||
      this.searchQuery() ||
      this.startDateFilter() ||
      this.endDateFilter()
    );
  }

  get pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);

    if (left > 2) {
      range.push(-1); // ellipsis
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < total - 1) {
      range.push(-1); // ellipsis
    }

    if (total > 1) {
      range.push(total);
    }

    return range;
  }
}

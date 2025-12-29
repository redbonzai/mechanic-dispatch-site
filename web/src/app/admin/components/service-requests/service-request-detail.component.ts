import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceRequestsService } from '../../services/service-requests.service';
import {
  AdminServiceRequestDetail,
  ServiceRequestStatus,
} from '../../models/service-request.model';

@Component({
  selector: 'app-service-request-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-request-detail.component.html',
  styleUrls: ['./service-request-detail.component.scss'],
})
export class ServiceRequestDetailComponent implements OnInit {
  request = signal<AdminServiceRequestDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal(false);
  actionError = signal<string | null>(null);

  showFinalizeModal = signal(false);
  finalizeAmount = signal<number>(0);

  readonly ServiceRequestStatus = ServiceRequestStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceRequestsService: ServiceRequestsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRequest(id);
    } else {
      this.error.set('No request ID provided');
    }
  }

  loadRequest(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.serviceRequestsService.getById(id).subscribe({
      next: (request) => {
        this.request.set(request);
        this.finalizeAmount.set(request.amountCents / 100);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load service request');
        this.loading.set(false);
        console.error('Error loading service request:', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/service-requests']);
  }

  onCapture(): void {
    const req = this.request();
    if (!req) return;

    if (!confirm('Capture payment for this service request?')) {
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set(null);

    this.serviceRequestsService.capture(req.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadRequest(req.id);
      },
      error: (err) => {
        this.actionError.set('Failed to capture payment');
        this.actionLoading.set(false);
        console.error('Error capturing payment:', err);
      },
    });
  }

  onCancel(): void {
    const req = this.request();
    if (!req) return;

    if (!confirm('Cancel this service request? This cannot be undone.')) {
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set(null);

    this.serviceRequestsService.cancel(req.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadRequest(req.id);
      },
      error: (err) => {
        this.actionError.set('Failed to cancel request');
        this.actionLoading.set(false);
        console.error('Error cancelling request:', err);
      },
    });
  }

  openFinalizeModal(): void {
    this.showFinalizeModal.set(true);
  }

  closeFinalizeModal(): void {
    this.showFinalizeModal.set(false);
    this.actionError.set(null);
  }

  onFinalize(): void {
    const req = this.request();
    if (!req) return;

    const amountCents = Math.round(this.finalizeAmount() * 100);

    if (amountCents <= 0) {
      this.actionError.set('Amount must be greater than zero');
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set(null);

    this.serviceRequestsService.finalize(req.id, amountCents).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeFinalizeModal();
        this.loadRequest(req.id);
      },
      error: (err) => {
        this.actionError.set('Failed to finalize request');
        this.actionLoading.set(false);
        console.error('Error finalizing request:', err);
      },
    });
  }

  getStatusClass(status: ServiceRequestStatus): string {
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
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(amountCents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountCents / 100);
  }

  formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins}m`;
    }
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  canCapture(): boolean {
    const req = this.request();
    return req?.status === ServiceRequestStatus.AUTHORIZED;
  }

  canCancel(): boolean {
    const req = this.request();
    return (
      req?.status === ServiceRequestStatus.PENDING ||
      req?.status === ServiceRequestStatus.AUTHORIZED
    );
  }

  canFinalize(): boolean {
    const req = this.request();
    return req?.status === ServiceRequestStatus.CAPTURED;
  }
}

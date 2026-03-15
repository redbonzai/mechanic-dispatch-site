import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MechanicAuthService } from '../../services/mechanic-auth.service';
import { SubscriptionService, SubscriptionStatusResponse } from '../../services/subscription.service';
import { SubscriptionPlan } from '../../models/auth.models';

@Component({
  selector: 'app-mechanic-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './mechanic-dashboard.component.html',
  styleUrls: ['./mechanic-dashboard.component.scss'],
})
export class MechanicDashboardComponent implements OnInit {
  subscriptionStatus = signal<SubscriptionStatusResponse | null>(null);
  plans = signal<SubscriptionPlan[]>([]);
  selectedPlan = signal<string | null>(null);
  activeTab = signal<'overview' | 'subscription' | 'profile'>('overview');

  constructor(
    readonly mechAuth: MechanicAuthService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  ngOnInit() {
    this.subscriptionService.getStatus().subscribe({
      next: (s) => this.subscriptionStatus.set(s),
    });
    this.subscriptionService.getPlans().subscribe({
      next: (p) => this.plans.set(p),
    });
  }

  formatPrice(cents: number): string {
    return `$${Math.round(cents / 100)}/mo`;
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get mechanic() {
    return this.mechAuth.currentMechanic();
  }

  get subscriptionActive(): boolean {
    const s = this.subscriptionStatus();
    return s?.status === 'ACTIVE' || s?.status === 'TRIALING';
  }

  getStatusBadgeClass(status?: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'badge--active',
      TRIALING: 'badge--trial',
      PAST_DUE: 'badge--warning',
      CANCELLED: 'badge--danger',
      INACTIVE: 'badge--muted',
    };
    return map[status ?? 'INACTIVE'] ?? 'badge--muted';
  }
}

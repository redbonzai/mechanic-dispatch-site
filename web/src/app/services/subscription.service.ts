import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SubscriptionPlan } from '../models/auth.models';
import { environment } from '../../environments/environment';

export interface SubscriptionStatusResponse {
  status: string;
  tier: string | null;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getPlans() {
    return this.http.get<SubscriptionPlan[]>(
      `${this.apiUrl}/mechanic/subscription/plans`,
    );
  }

  createSubscription(tier: string, paymentMethodId: string) {
    return this.http.post(`${this.apiUrl}/mechanic/subscription`, {
      tier,
      paymentMethodId,
    });
  }

  cancelSubscription() {
    return this.http.delete(`${this.apiUrl}/mechanic/subscription`);
  }

  getStatus() {
    return this.http.get<SubscriptionStatusResponse>(
      `${this.apiUrl}/mechanic/subscription/status`,
    );
  }
}

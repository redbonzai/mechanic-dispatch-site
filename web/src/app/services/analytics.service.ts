import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare function gtag(...args: unknown[]): void;

interface GtagWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly measurementId = environment.ga4MeasurementId;
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {
    if (this.measurementId) {
      this.initGA4();
    }
  }

  private initGA4(): void {
    try {
      const win = window as GtagWindow;
      if (win.gtag) {
        (win.gtag as (...args: unknown[]) => void)('config', this.measurementId, {
          send_page_view: false,
        });
      }
    } catch {
      // GA4 not loaded — silently skip
    }
  }

  private fire(eventName: string, params?: Record<string, unknown>): void {
    try {
      const win = window as GtagWindow;
      if (win.gtag) {
        (win.gtag as (...args: unknown[]) => void)('event', eventName, {
          ...(params ?? {}),
          send_to: this.measurementId || undefined,
        });
      }
    } catch {
      // GA4 not loaded — silently skip
    }
  }

  pageView(path: string, title?: string): void {
    this.fire('page_view', { page_path: path, page_title: title });
  }

  searchFix(query: string, make?: string, model?: string, year?: number): void {
    this.fire('search_fix', {
      search_term: query,
      vehicle_make: make,
      vehicle_model: model,
      vehicle_year: year,
    });

    // Also fire to backend Measurement Protocol endpoint
    this.http
      .post(`${this.apiUrl}/analytics/events`, {
        event: 'search_fix',
        params: { query, make, model, year },
      })
      .subscribe({ error: () => null });
  }

  viewMechanicProfile(mechanicId: string, source?: string): void {
    this.fire('view_mechanic_profile', {
      mechanic_id: mechanicId,
      source,
    });
  }

  clickMechanicLink(mechanicId: string, linkType: 'phone' | 'website'): void {
    this.fire('click_mechanic_link', {
      mechanic_id: mechanicId,
      link_type: linkType,
    });
  }

  mechanicRegisterStart(): void {
    this.fire('mechanic_register_start');
  }

  mechanicRegisterComplete(tier: string): void {
    this.fire('mechanic_register_complete', { subscription_tier: tier });
  }

  userRegisterComplete(): void {
    this.fire('user_register_complete');
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface GA4Event {
  event: string;
  params?: Record<string, unknown>;
  clientId?: string;
}

/**
 * Sends events to GA4 via the Measurement Protocol.
 * Requires GA4_MEASUREMENT_ID and GA4_API_SECRET to be set in environment.
 *
 * Documentation: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly measurementId = process.env['GA4_MEASUREMENT_ID'] ?? '';
  private readonly apiSecret = process.env['GA4_API_SECRET'] ?? '';

  constructor(private readonly http: HttpService) {}

  async fireEvent(ga4Event: GA4Event): Promise<void> {
    if (!this.measurementId || !this.apiSecret) {
      // GA4 not configured — log in dev and silently skip
      this.logger.debug(
        `[GA4 skipped] ${ga4Event.event}: ${JSON.stringify(ga4Event.params)}`,
      );
      return;
    }

    const clientId = ga4Event.clientId ?? 'server-' + Date.now();
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;

    try {
      const post$ = this.http.post(url, {
        client_id: clientId,
        events: [{ name: ga4Event.event, params: ga4Event.params ?? {} }],
      });

      await firstValueFrom(post$);
    } catch (err) {
      // Non-critical — never let analytics failures surface to the user
      this.logger.warn(`GA4 event delivery failed: ${String(err)}`);
    }
  }

  async trackSearch(
    query: string,
    make?: string,
    model?: string,
    year?: number,
  ): Promise<void> {
    await this.fireEvent({
      event: 'search_fix',
      params: {
        search_term: query,
        vehicle_make: make,
        vehicle_model: model,
        vehicle_year: year,
      },
    });
  }

  async trackMechanicView(mechanicId: string, source?: string): Promise<void> {
    await this.fireEvent({
      event: 'view_mechanic_profile',
      params: { mechanic_id: mechanicId, source },
    });
  }
}

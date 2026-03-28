import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AnalyticsService } from './analytics.service';
import { OverviewStats, SubscriptionMetrics } from '../models/analytics.model';
import { environment } from '../../../environments/environment';

const mockOverview: OverviewStats = {
  totalUsers: 100,
  activeUsers: 80,
  totalMechanics: 20,
  activeMechanics: 15,
  totalSubscriptions: 15,
  activeSubscriptions: 12,
  trialSubscriptions: 3,
  monthlyRevenueCents: 70000,
  totalSearchQueries: 500,
  searchQueriesThisMonth: 60,
  totalReviews: 45,
  averageRating: 4.5,
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/admin/analytics/overview', () => {
    service.getOverview().subscribe((data) => {
      expect(data).toEqual(mockOverview);
    });

    const req = httpMock.expectOne('/api/admin/analytics/overview');
    expect(req.request.method).toBe('GET');
    req.flush(mockOverview);
  });

  it('should call GET /admin/analytics/subscriptions', () => {
    const mockSubs: SubscriptionMetrics = {
      breakdown: [],
      totalRevenueCents: 0,
      totalActive: 0,
      totalTrialing: 0,
      totalCancelled: 0,
      totalPastDue: 0,
    };

    service.getSubscriptions().subscribe((data) => {
      expect(data).toEqual(mockSubs);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/analytics/subscriptions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSubs);
  });

  it('should call GET /admin/analytics/search/top-queries', () => {
    service.getTopQueries(10).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/admin/analytics/search/top-queries?limit=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ queries: [] });
  });
});

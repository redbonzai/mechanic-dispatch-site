import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AnalyticsService } from '../../services/analytics.service';
import {
  OverviewStats,
  SubscriptionMetrics,
  TopQueriesResponse,
  SearchVolumeResponse,
  MechanicAnalyticsResponse,
} from '../../models/analytics.model';

const mockOverview: OverviewStats = {
  totalUsers: 500,
  activeUsers: 320,
  totalMechanics: 80,
  activeMechanics: 60,
  totalSubscriptions: 60,
  activeSubscriptions: 45,
  trialSubscriptions: 10,
  monthlyRevenueCents: 250000,
  totalSearchQueries: 4000,
  searchQueriesThisMonth: 450,
  totalReviews: 210,
  averageRating: 4.6,
};

const mockSubscriptions: SubscriptionMetrics = {
  breakdown: [
    { tier: 'BASIC', count: 20, revenueCents: 58000 },
    { tier: 'PRO', count: 18, revenueCents: 106200 },
    { tier: 'PREMIUM', count: 7, revenueCents: 69300 },
  ],
  totalRevenueCents: 233500,
  totalActive: 45,
  totalTrialing: 10,
  totalCancelled: 5,
  totalPastDue: 2,
};

const mockTopQueries: TopQueriesResponse = {
  queries: [
    { query: 'check engine light', count: 120, lastSearched: '2026-03-10' },
  ],
};

const mockSearchVolume: SearchVolumeResponse = {
  dataPoints: [{ date: '2026-03-01', count: 45 }],
  total: 450,
};

const mockMechanicAnalytics: MechanicAnalyticsResponse = {
  mechanics: [
    {
      id: 'mech-1',
      name: 'John Doe',
      location: 'Austin, TX',
      subscriptionTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
      profileViews: 200,
      searchAppearances: 800,
      linkClicks: 40,
      rating: 4.8,
      reviewCount: 22,
    },
  ],
  total: 1,
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AnalyticsService', [
      'getOverview',
      'getSubscriptions',
      'getTopQueries',
      'getSearchVolume',
      'getMechanicAnalytics',
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AnalyticsService, useValue: spy },
        provideHttpClient(),
        provideRouter([]),
      ],
    }).compileComponents();

    analyticsService = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
    analyticsService.getOverview.and.returnValue(of(mockOverview));
    analyticsService.getSubscriptions.and.returnValue(of(mockSubscriptions));
    analyticsService.getTopQueries.and.returnValue(of(mockTopQueries));
    analyticsService.getSearchVolume.and.returnValue(of(mockSearchVolume));
    analyticsService.getMechanicAnalytics.and.returnValue(of(mockMechanicAnalytics));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.isLoading).toBe(true);
    expect(component.error).toBeNull();
  });

  it('should load analytics on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(analyticsService.getOverview).toHaveBeenCalled();
    expect(analyticsService.getSubscriptions).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
    expect(component.overview).toEqual(mockOverview);
  });

  it('should set error on load failure', async () => {
    analyticsService.getOverview.and.returnValue(
      throwError(() => new Error('network error')),
    );

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.error).toBe('Failed to load analytics data. Please try again.');
    expect(component.isLoading).toBe(false);
  });

  it('should format currency correctly', () => {
    expect(component.formatCurrency(0)).toBe('$0');
    expect(component.formatCurrency(100)).toBe('$1');
    expect(component.formatCurrency(150000)).toBe('$1,500');
  });
});

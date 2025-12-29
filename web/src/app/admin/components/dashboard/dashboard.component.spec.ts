import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AnalyticsService } from '../../services/analytics.service';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance,
} from '../../models/analytics.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  // Mock data
  const mockOverview: OverviewStats = {
    totalRequests: 150,
    pendingRequests: 10,
    authorizedRequests: 5,
    capturedRequests: 8,
    finalizedRequests: 120,
    cancelledRequests: 7,
    totalRevenueCents: 1500000,
    activeMechanics: 12,
    totalMechanics: 15,
    totalReviews: 85,
    averageRating: 4.6,
    totalWorkLogs: 250,
  };

  const mockRevenue: RevenueMetrics = {
    dataPoints: [
      {
        date: '2025-01-01',
        revenueCents: 50000,
        finalizedCount: 5,
        averageRequestCents: 10000,
      },
    ],
    summary: {
      totalRevenueCents: 50000,
      totalFinalizedCount: 5,
      averageRevenueCents: 10000,
      peakRevenueCents: 50000,
      peakRevenueDate: '2025-01-01',
    },
  };

  const mockMechanics: MechanicsPerformance = {
    mechanics: [
      {
        id: 'mech-1',
        name: 'John Doe',
        completedJobs: 25,
        totalHoursWorked: 120.5,
        totalEarningsCents: 300000,
        averageRating: 4.8,
        reviewCount: 20,
        isActive: true,
      },
    ],
    summary: {
      totalMechanics: 1,
      activeMechanics: 1,
      totalCompletedJobs: 25,
      totalHoursWorked: 120.5,
      averageRating: 4.8,
    },
  };

  beforeEach(async () => {
    // Arrange: Create spy object for AnalyticsService
    const analyticsSpy = jasmine.createSpyObj('AnalyticsService', [
      'getOverview',
      'getRevenue',
      'getMechanics',
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AnalyticsService, useValue: analyticsSpy },
        provideHttpClient(),
      ],
    }).compileComponents();

    analyticsService = TestBed.inject(
      AnalyticsService
    ) as jasmine.SpyObj<AnalyticsService>;
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Arrange: Set up spy returns
    analyticsService.getOverview.and.returnValue(of(mockOverview));
    analyticsService.getRevenue.and.returnValue(of(mockRevenue));
    analyticsService.getMechanics.and.returnValue(of(mockMechanics));

    // Act: Trigger component creation
    fixture.detectChanges();

    // Assert: Component should be created
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    // Arrange: Component not yet initialized
    // (loading state is set in constructor)

    // Act: Check initial state
    const isLoading = component.isLoading;

    // Assert: Should be loading initially
    expect(isLoading).toBe(true);
    expect(component.error).toBeNull();
  });

  it('should load all analytics data on init', async () => {
    // Arrange: Set up service spies
    analyticsService.getOverview.and.returnValue(of(mockOverview));
    analyticsService.getRevenue.and.returnValue(of(mockRevenue));
    analyticsService.getMechanics.and.returnValue(of(mockMechanics));

    // Act: Trigger ngOnInit
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: All services should be called
    expect(analyticsService.getOverview).toHaveBeenCalled();
    expect(analyticsService.getRevenue).toHaveBeenCalled();
    expect(analyticsService.getMechanics).toHaveBeenCalled();

    // Assert: Loading should be false
    expect(component.isLoading).toBe(false);
  });

  it('should populate overview stats correctly', async () => {
    // Arrange: Set up service spies
    analyticsService.getOverview.and.returnValue(of(mockOverview));
    analyticsService.getRevenue.and.returnValue(of(mockRevenue));
    analyticsService.getMechanics.and.returnValue(of(mockMechanics));

    // Act: Trigger ngOnInit
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: Overview data should be populated
    expect(component.overview).toEqual(mockOverview);
    expect(component.overview?.totalRequests).toBe(150);
    expect(component.overview?.activeMechanics).toBe(12);
  });

  it('should populate revenue metrics correctly', async () => {
    // Arrange: Set up service spies
    analyticsService.getOverview.and.returnValue(of(mockOverview));
    analyticsService.getRevenue.and.returnValue(of(mockRevenue));
    analyticsService.getMechanics.and.returnValue(of(mockMechanics));

    // Act: Trigger ngOnInit
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: Revenue data should be populated
    expect(component.revenue).toEqual(mockRevenue);
    expect(component.revenue?.dataPoints.length).toBe(1);
    expect(component.revenue?.summary.totalRevenueCents).toBe(50000);
  });

  it('should populate mechanics performance correctly', async () => {
    // Arrange: Set up service spies
    analyticsService.getOverview.and.returnValue(of(mockOverview));
    analyticsService.getRevenue.and.returnValue(of(mockRevenue));
    analyticsService.getMechanics.and.returnValue(of(mockMechanics));

    // Act: Trigger ngOnInit
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: Mechanics data should be populated
    expect(component.mechanics).toEqual(mockMechanics);
    expect(component.mechanics?.mechanics.length).toBe(1);
    expect(component.mechanics?.mechanics[0].name).toBe('John Doe');
  });

  it('should handle errors when loading data', async () => {
    // Arrange: Set up service to throw error
    const errorMessage = 'Failed to load analytics';
    analyticsService.getOverview.and.returnValue(
      throwError(() => new Error(errorMessage))
    );
    analyticsService.getRevenue.and.returnValue(of(mockRevenue));
    analyticsService.getMechanics.and.returnValue(of(mockMechanics));

    // Act: Trigger ngOnInit
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: Error should be set
    expect(component.isLoading).toBe(false);
    expect(component.error).toBe(
      'Failed to load analytics data. Please try again.'
    );
  });

  it('should retry loading data on retry', async () => {
    // Arrange: First call fails, second succeeds
    analyticsService.getOverview.and.returnValues(
      throwError(() => new Error('Error')),
      of(mockOverview)
    );
    analyticsService.getRevenue.and.returnValue(of(mockRevenue));
    analyticsService.getMechanics.and.returnValue(of(mockMechanics));

    // Act: First load (fails)
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: Error should be set
    expect(component.error).toBeTruthy();

    // Act: Retry
    await component.retryLoad();
    await fixture.whenStable();

    // Assert: Should have called services again
    expect(analyticsService.getOverview).toHaveBeenCalledTimes(2);
    expect(component.error).toBeNull();
  });

  it('should format currency correctly', () => {
    // Arrange: Various cent values
    const testCases = [
      { cents: 0, expected: '$0.00' },
      { cents: 100, expected: '$1.00' },
      { cents: 1234, expected: '$12.34' },
      { cents: 1500000, expected: '$15,000.00' },
      { cents: 99999999, expected: '$999,999.99' },
    ];

    testCases.forEach(({ cents, expected }) => {
      // Act: Format currency
      const result = component.formatCurrency(cents);

      // Assert: Should match expected format
      expect(result).toBe(expected);
    });
  });

  it('should handle zero and negative values in formatCurrency', () => {
    // Arrange: Edge cases
    const testCases = [
      { cents: 0, expected: '$0.00' },
      { cents: -100, expected: '-$1.00' },
      { cents: -1234, expected: '-$12.34' },
    ];

    testCases.forEach(({ cents, expected }) => {
      // Act: Format currency
      const result = component.formatCurrency(cents);

      // Assert: Should handle edge cases
      expect(result).toBe(expected);
    });
  });

  it('should calculate completion rate correctly', async () => {
    // Arrange: Set up overview data
    analyticsService.getOverview.and.returnValue(of(mockOverview));
    analyticsService.getRevenue.and.returnValue(of(mockRevenue));
    analyticsService.getMechanics.and.returnValue(of(mockMechanics));

    // Act: Trigger ngOnInit and wait for async completion
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: Completion rate = (finalized / total) * 100
    // (120 / 150) * 100 = 80%
    const completionRate = component.completionRate;
    expect(completionRate).toBe(80);
  });
});

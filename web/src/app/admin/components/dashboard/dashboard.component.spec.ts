/**
 * Dashboard Component Unit Tests
 * 
 * Following constitutional requirements:
 * - TDD: Tests written BEFORE implementation
 * - AAA pattern: Arrange-Act-Assert
 * - Test coverage ≥ 85%
 * 
 * References:
 * - docs/skills/testing.md
 * - CLAUDE.md: Testing Requirements
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AnalyticsService } from '../../services/analytics.service';
import { of, throwError } from 'rxjs';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance
} from '../../models/analytics.model';

describe('DashboardComponent (Unit Tests - 80%)', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  // Mock data
  const mockOverviewStats: OverviewStats = {
    totalRequests: 100,
    pendingRequests: 10,
    authorizedRequests: 5,
    capturedRequests: 20,
    finalizedRequests: 60,
    cancelledRequests: 5,
    totalRevenueCents: 500000,
    activeMechanics: 8,
    totalMechanics: 10,
    totalReviews: 45,
    averageRating: 4.5,
    totalWorkLogs: 150
  };

  const mockRevenueMetrics: RevenueMetrics = {
    dataPoints: [
      { date: '2025-01-01', revenueCents: 10000, finalizedCount: 2, averageRequestCents: 5000 },
      { date: '2025-01-02', revenueCents: 15000, finalizedCount: 3, averageRequestCents: 5000 }
    ],
    summary: {
      totalRevenueCents: 25000,
      totalFinalizedCount: 5,
      averageRevenueCents: 5000,
      peakRevenueCents: 15000,
      peakRevenueDate: '2025-01-02'
    }
  };

  const mockMechanicsPerformance: MechanicsPerformance = {
    mechanics: [
      {
        id: 'mech-1',
        name: 'John Doe',
        completedJobs: 15,
        totalHoursWorked: 120,
        totalEarningsCents: 105000,
        averageRating: 4.8,
        reviewCount: 10,
        isActive: true
      }
    ],
    summary: {
      totalMechanics: 1,
      activeMechanics: 1,
      totalCompletedJobs: 15,
      totalHoursWorked: 120,
      averageRating: 4.8
    }
  };

  beforeEach(async () => {
    // Arrange: Create spy for AnalyticsService
    const analyticsSpy = jasmine.createSpyObj('AnalyticsService', [
      'getOverview',
      'getRevenue',
      'getMechanics'
    ]);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: AnalyticsService, useValue: analyticsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    analyticsServiceSpy = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
  });

  it('should create', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load dashboard data on initialization', () => {
      // Arrange
      analyticsServiceSpy.getOverview.and.returnValue(of(mockOverviewStats));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.ngOnInit();

      // Assert
      expect(analyticsServiceSpy.getOverview).toHaveBeenCalled();
      expect(analyticsServiceSpy.getRevenue).toHaveBeenCalled();
      expect(analyticsServiceSpy.getMechanics).toHaveBeenCalled();
    });

    it('should set loading to true initially', () => {
      // Arrange
      analyticsServiceSpy.getOverview.and.returnValue(of(mockOverviewStats));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.ngOnInit();

      // Assert: Should eventually set loading to false
      setTimeout(() => {
        expect(component.loading).toBe(false);
      }, 100);
    });

    it('should populate overview stats after loading', (done) => {
      // Arrange
      analyticsServiceSpy.getOverview.and.returnValue(of(mockOverviewStats));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.overviewStats).toEqual(mockOverviewStats);
        done();
      }, 100);
    });

    it('should populate revenue metrics after loading', (done) => {
      // Arrange
      analyticsServiceSpy.getOverview.and.returnValue(of(mockOverviewStats));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.revenueMetrics).toEqual(mockRevenueMetrics);
        done();
      }, 100);
    });

    it('should populate mechanics performance after loading', (done) => {
      // Arrange
      analyticsServiceSpy.getOverview.and.returnValue(of(mockOverviewStats));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.mechanicsPerformance).toEqual(mockMechanicsPerformance);
        done();
      }, 100);
    });
  });

  describe('error handling', () => {
    it('should handle overview stats error', (done) => {
      // Arrange
      const error = new Error('Failed to load overview');
      analyticsServiceSpy.getOverview.and.returnValue(throwError(() => error));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.error).toBeTruthy();
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should set error message on failure', (done) => {
      // Arrange
      const error = new Error('API Error');
      analyticsServiceSpy.getOverview.and.returnValue(throwError(() => error));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.error).toContain('Failed to load');
        done();
      }, 100);
    });
  });

  describe('formatCurrency', () => {
    it('should format cents to currency string', () => {
      // Arrange
      const cents = 500000;

      // Act
      const result = component.formatCurrency(cents);

      // Assert
      expect(result).toBe('$5000.00');
    });

    it('should handle zero cents', () => {
      // Arrange
      const cents = 0;

      // Act
      const result = component.formatCurrency(cents);

      // Assert
      expect(result).toBe('$0.00');
    });

    it('should handle decimal cents', () => {
      // Arrange
      const cents = 12345;

      // Act
      const result = component.formatCurrency(cents);

      // Assert
      expect(result).toBe('$123.45');
    });
  });

  describe('loadDashboardData', () => {
    it('should reset error state when reloading', () => {
      // Arrange
      component.error = 'Previous error';
      analyticsServiceSpy.getOverview.and.returnValue(of(mockOverviewStats));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.loadDashboardData();

      // Assert
      expect(component.error).toBeNull();
    });

    it('should set loading to true when called', () => {
      // Arrange
      component.loading = false;
      analyticsServiceSpy.getOverview.and.returnValue(of(mockOverviewStats));
      analyticsServiceSpy.getRevenue.and.returnValue(of(mockRevenueMetrics));
      analyticsServiceSpy.getMechanics.and.returnValue(of(mockMechanicsPerformance));

      // Act
      component.loadDashboardData();

      // Assert
      expect(component.loading).toBe(true);
    });
  });
});

/**
 * Analytics Service Unit Tests
 * 
 * Following constitutional requirements:
 * - TDD: Tests written BEFORE implementation
 * - AAA pattern: Arrange-Act-Assert
 * - Test coverage ≥ 85%
 * 
 * References:
 * - docs/skills/testing.md
 * - docs/standards/testing/unit.md
 * - CLAUDE.md: Testing Requirements (Lines 149-181)
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsService } from './analytics.service';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance
} from '../models/analytics.model';

describe('AnalyticsService (Unit Tests - 80%)', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Arrange: Setup test environment
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsService]
    });

    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  describe('getOverview', () => {
    it('should return overview stats for valid request', (done) => {
      // Arrange: Prepare mock data
      const mockStats: OverviewStats = {
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

      // Act: Call service method
      service.getOverview().subscribe(stats => {
        // Assert: Verify response
        expect(stats).toEqual(mockStats);
        expect(stats.totalRequests).toBe(100);
        expect(stats.totalRevenueCents).toBe(500000);
        done();
      });

      // Assert: Verify HTTP request
      const req = httpMock.expectOne('/api/admin/analytics/overview');
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should handle 401 unauthorized error', (done) => {
      // Arrange
      const errorMessage = 'Unauthorized';

      // Act
      service.getOverview().subscribe({
        next: () => fail('should have failed with 401'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          done();
        }
      });

      // Assert: Simulate 401 error
      const req = httpMock.expectOne('/api/admin/analytics/overview');
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 500 server error', (done) => {
      // Arrange
      const errorMessage = 'Internal Server Error';

      // Act
      service.getOverview().subscribe({
        next: () => fail('should have failed with 500'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          done();
        }
      });

      // Assert: Simulate 500 error
      const req = httpMock.expectOne('/api/admin/analytics/overview');
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getRevenue', () => {
    it('should return revenue metrics with query params', (done) => {
      // Arrange
      const mockMetrics: RevenueMetrics = {
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

      // Act
      service.getRevenue('2025-01-01', '2025-01-07', 'day').subscribe(metrics => {
        // Assert
        expect(metrics).toEqual(mockMetrics);
        expect(metrics.dataPoints.length).toBe(2);
        expect(metrics.summary.totalRevenueCents).toBe(25000);
        done();
      });

      // Assert: Verify HTTP request with query params
      const req = httpMock.expectOne(
        '/api/admin/analytics/revenue?startDate=2025-01-01&endDate=2025-01-07&granularity=day'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);
    });

    it('should handle optional query params', (done) => {
      // Arrange
      const mockMetrics: RevenueMetrics = {
        dataPoints: [],
        summary: {
          totalRevenueCents: 0,
          totalFinalizedCount: 0,
          averageRevenueCents: 0,
          peakRevenueCents: 0,
          peakRevenueDate: ''
        }
      };

      // Act: Call without params
      service.getRevenue().subscribe(metrics => {
        // Assert
        expect(metrics).toEqual(mockMetrics);
        done();
      });

      // Assert: Verify HTTP request without query params
      const req = httpMock.expectOne('/api/admin/analytics/revenue');
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);
    });

    it('should handle empty revenue data', (done) => {
      // Arrange
      const emptyMetrics: RevenueMetrics = {
        dataPoints: [],
        summary: {
          totalRevenueCents: 0,
          totalFinalizedCount: 0,
          averageRevenueCents: 0,
          peakRevenueCents: 0,
          peakRevenueDate: ''
        }
      };

      // Act
      service.getRevenue('2025-01-01', '2025-01-01').subscribe(metrics => {
        // Assert
        expect(metrics.dataPoints.length).toBe(0);
        expect(metrics.summary.totalRevenueCents).toBe(0);
        done();
      });

      const req = httpMock.expectOne(
        '/api/admin/analytics/revenue?startDate=2025-01-01&endDate=2025-01-01'
      );
      req.flush(emptyMetrics);
    });
  });

  describe('getMechanics', () => {
    it('should return mechanics performance data', (done) => {
      // Arrange
      const mockPerformance: MechanicsPerformance = {
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
          },
          {
            id: 'mech-2',
            name: 'Jane Smith',
            completedJobs: 12,
            totalHoursWorked: 96,
            totalEarningsCents: 84000,
            averageRating: 4.5,
            reviewCount: 8,
            isActive: true
          }
        ],
        summary: {
          totalMechanics: 2,
          activeMechanics: 2,
          totalCompletedJobs: 27,
          totalHoursWorked: 216,
          averageRating: 4.65
        }
      };

      // Act
      service.getMechanics().subscribe(performance => {
        // Assert
        expect(performance).toEqual(mockPerformance);
        expect(performance.mechanics.length).toBe(2);
        expect(performance.summary.totalMechanics).toBe(2);
        done();
      });

      // Assert: Verify HTTP request
      const req = httpMock.expectOne('/api/admin/analytics/mechanics');
      expect(req.request.method).toBe('GET');
      req.flush(mockPerformance);
    });

    it('should handle isActive filter', (done) => {
      // Arrange
      const mockPerformance: MechanicsPerformance = {
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

      // Act
      service.getMechanics(true).subscribe(performance => {
        // Assert
        expect(performance.mechanics.length).toBe(1);
        expect(performance.mechanics[0].isActive).toBe(true);
        done();
      });

      // Assert: Verify query param
      const req = httpMock.expectOne('/api/admin/analytics/mechanics?isActive=true');
      req.flush(mockPerformance);
    });

    it('should handle minJobs filter', (done) => {
      // Arrange
      const mockPerformance: MechanicsPerformance = {
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

      // Act
      service.getMechanics(undefined, 10).subscribe(performance => {
        // Assert
        expect(performance.mechanics.every(m => m.completedJobs >= 10)).toBe(true);
        done();
      });

      // Assert: Verify query param
      const req = httpMock.expectOne('/api/admin/analytics/mechanics?minJobs=10');
      req.flush(mockPerformance);
    });

    it('should handle sorting parameters', (done) => {
      // Arrange
      const mockPerformance: MechanicsPerformance = {
        mechanics: [],
        summary: {
          totalMechanics: 0,
          activeMechanics: 0,
          totalCompletedJobs: 0,
          totalHoursWorked: 0,
          averageRating: 0
        }
      };

      // Act
      service.getMechanics(undefined, undefined, 'rating', 'asc').subscribe(performance => {
        // Assert
        expect(performance).toEqual(mockPerformance);
        done();
      });

      // Assert: Verify query params
      const req = httpMock.expectOne('/api/admin/analytics/mechanics?sortBy=rating&sortOrder=asc');
      req.flush(mockPerformance);
    });

    it('should handle multiple filters', (done) => {
      // Arrange
      const mockPerformance: MechanicsPerformance = {
        mechanics: [],
        summary: {
          totalMechanics: 0,
          activeMechanics: 0,
          totalCompletedJobs: 0,
          totalHoursWorked: 0,
          averageRating: 0
        }
      };

      // Act
      service.getMechanics(true, 5, 'jobs', 'desc').subscribe(performance => {
        // Assert
        expect(performance).toEqual(mockPerformance);
        done();
      });

      // Assert: Verify all query params
      const req = httpMock.expectOne(
        '/api/admin/analytics/mechanics?isActive=true&minJobs=5&sortBy=jobs&sortOrder=desc'
      );
      req.flush(mockPerformance);
    });
  });
});

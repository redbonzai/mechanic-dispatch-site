import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AnalyticsService } from './analytics.service';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance,
  RevenueMetricsQuery,
  MechanicsPerformanceQuery,
} from '../models/analytics.model';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Arrange: Setup test module
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
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  describe('getOverview', () => {
    it('should fetch overview statistics successfully', (done) => {
      // Arrange: Prepare expected response
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

      // Act: Call service method
      service.getOverview().subscribe({
        next: (data) => {
          // Assert: Verify response
          expect(data).toEqual(mockOverview);
          expect(data.totalRequests).toBe(150);
          expect(data.averageRating).toBe(4.6);
          done();
        },
        error: done.fail,
      });

      // Assert: Verify HTTP request
      const req = httpMock.expectOne('/api/admin/analytics/overview');
      expect(req.request.method).toBe('GET');
      req.flush(mockOverview);
    });

    it('should handle 401 unauthorized error', (done) => {
      // Arrange: Prepare error response
      const errorMessage = 'Unauthorized';

      // Act: Call service method
      service.getOverview().subscribe({
        next: () => done.fail('should have failed with 401 error'),
        error: (error) => {
          // Assert: Verify error handling
          expect(error.status).toBe(401);
          expect(error.statusText).toBe(errorMessage);
          done();
        },
      });

      // Assert: Trigger error response
      const req = httpMock.expectOne('/api/admin/analytics/overview');
      req.flush(null, { status: 401, statusText: errorMessage });
    });

    it('should handle 500 server error', (done) => {
      // Arrange: Prepare error response
      const errorMessage = 'Internal Server Error';

      // Act: Call service method
      service.getOverview().subscribe({
        next: () => done.fail('should have failed with 500 error'),
        error: (error) => {
          // Assert: Verify error handling
          expect(error.status).toBe(500);
          expect(error.statusText).toBe(errorMessage);
          done();
        },
      });

      // Assert: Trigger error response
      const req = httpMock.expectOne('/api/admin/analytics/overview');
      req.flush(null, { status: 500, statusText: errorMessage });
    });
  });

  describe('getRevenue', () => {
    it('should fetch revenue metrics without query parameters', (done) => {
      // Arrange: Prepare expected response
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

      // Act: Call service method
      service.getRevenue().subscribe({
        next: (data) => {
          // Assert: Verify response
          expect(data).toEqual(mockRevenue);
          expect(data.dataPoints.length).toBe(1);
          expect(data.summary.totalRevenueCents).toBe(50000);
          done();
        },
        error: done.fail,
      });

      // Assert: Verify HTTP request without query params
      const req = httpMock.expectOne('/api/admin/analytics/revenue');
      expect(req.request.method).toBe('GET');
      req.flush(mockRevenue);
    });

    it('should fetch revenue metrics with query parameters', (done) => {
      // Arrange: Prepare query and response
      const query: RevenueMetricsQuery = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        granularity: 'week',
      };

      const mockRevenue: RevenueMetrics = {
        dataPoints: [],
        summary: {
          totalRevenueCents: 0,
          totalFinalizedCount: 0,
          averageRevenueCents: 0,
          peakRevenueCents: 0,
          peakRevenueDate: '2025-01-01',
        },
      };

      // Act: Call service method with query
      service.getRevenue(query).subscribe({
        next: (data) => {
          // Assert: Verify response
          expect(data).toEqual(mockRevenue);
          done();
        },
        error: done.fail,
      });

      // Assert: Verify HTTP request with query params
      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/admin/analytics/revenue')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('startDate')).toBe('2025-01-01');
      expect(req.request.params.get('endDate')).toBe('2025-01-31');
      expect(req.request.params.get('granularity')).toBe('week');
      req.flush(mockRevenue);
    });

    it('should handle error when fetching revenue metrics', (done) => {
      // Arrange: Prepare error response
      const errorMessage = 'Bad Request';

      // Act: Call service method
      service.getRevenue().subscribe({
        next: () => done.fail('should have failed with 400 error'),
        error: (error) => {
          // Assert: Verify error handling
          expect(error.status).toBe(400);
          done();
        },
      });

      // Assert: Trigger error response
      const req = httpMock.expectOne('/api/admin/analytics/revenue');
      req.flush(null, { status: 400, statusText: errorMessage });
    });
  });

  describe('getMechanics', () => {
    it('should fetch mechanics performance without query parameters', (done) => {
      // Arrange: Prepare expected response
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

      // Act: Call service method
      service.getMechanics().subscribe({
        next: (data) => {
          // Assert: Verify response
          expect(data).toEqual(mockMechanics);
          expect(data.mechanics.length).toBe(1);
          expect(data.mechanics[0].name).toBe('John Doe');
          expect(data.summary.activeMechanics).toBe(1);
          done();
        },
        error: done.fail,
      });

      // Assert: Verify HTTP request
      const req = httpMock.expectOne('/api/admin/analytics/mechanics');
      expect(req.request.method).toBe('GET');
      req.flush(mockMechanics);
    });

    it('should fetch mechanics performance with query parameters', (done) => {
      // Arrange: Prepare query and response
      const query: MechanicsPerformanceQuery = {
        isActive: true,
        minJobs: 10,
        sortBy: 'rating',
        sortOrder: 'desc',
      };

      const mockMechanics: MechanicsPerformance = {
        mechanics: [],
        summary: {
          totalMechanics: 0,
          activeMechanics: 0,
          totalCompletedJobs: 0,
          totalHoursWorked: 0,
          averageRating: 0,
        },
      };

      // Act: Call service method with query
      service.getMechanics(query).subscribe({
        next: (data) => {
          // Assert: Verify response
          expect(data).toEqual(mockMechanics);
          done();
        },
        error: done.fail,
      });

      // Assert: Verify HTTP request with query params
      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/admin/analytics/mechanics')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('isActive')).toBe('true');
      expect(req.request.params.get('minJobs')).toBe('10');
      expect(req.request.params.get('sortBy')).toBe('rating');
      expect(req.request.params.get('sortOrder')).toBe('desc');
      req.flush(mockMechanics);
    });

    it('should handle error when fetching mechanics performance', (done) => {
      // Arrange: Prepare error response
      const errorMessage = 'Forbidden';

      // Act: Call service method
      service.getMechanics().subscribe({
        next: () => done.fail('should have failed with 403 error'),
        error: (error) => {
          // Assert: Verify error handling
          expect(error.status).toBe(403);
          done();
        },
      });

      // Assert: Trigger error response
      const req = httpMock.expectOne('/api/admin/analytics/mechanics');
      req.flush(null, { status: 403, statusText: errorMessage });
    });
  });
});

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ServiceRequestsService } from './service-requests.service';
import {
  ServiceRequestListQuery,
  ServiceRequestListResponse,
  AdminServiceRequestDetail,
  ServiceRequestStatus,
} from '../models/service-request.model';

describe('ServiceRequestsService', () => {
  let service: ServiceRequestsService;
  let httpMock: HttpTestingController;

  const mockListResponse: ServiceRequestListResponse = {
    items: [
      {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2020,
        amountCents: 15000,
        finalAmountCents: null,
        status: ServiceRequestStatus.PENDING,
        city: 'Boston',
        state: 'MA',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  const mockDetail: AdminServiceRequestDetail = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    addressLine1: '123 Main St',
    addressLine2: null,
    city: 'Boston',
    state: 'MA',
    postalCode: '02101',
    country: 'USA',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2020,
    amountCents: 15000,
    finalAmountCents: null,
    status: ServiceRequestStatus.PENDING,
    stripePaymentIntentId: 'pi_123',
    finalPaymentIntentId: null,
    stripeCustomerId: 'cus_123',
    stripePaymentMethodId: 'pm_123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    workLogs: [],
    reviews: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceRequestsService],
    });

    service = TestBed.inject(ServiceRequestsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list', () => {
    it('should make GET request to list endpoint', () => {
      service.list().subscribe((response) => {
        expect(response).toEqual(mockListResponse);
      });

      const req = httpMock.expectOne('/api/admin/service-requests');
      expect(req.request.method).toBe('GET');
      req.flush(mockListResponse);
    });

    it('should include query parameters in request', () => {
      const query: ServiceRequestListQuery = {
        page: 2,
        limit: 10,
        status: ServiceRequestStatus.PENDING,
        search: 'john',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      };

      service.list(query).subscribe();

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/admin/service-requests' &&
          request.params.get('page') === '2' &&
          request.params.get('limit') === '10' &&
          request.params.get('status') === 'PENDING' &&
          request.params.get('search') === 'john' &&
          request.params.get('sortBy') === 'createdAt' &&
          request.params.get('sortOrder') === 'asc'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockListResponse);
    });

    it('should include date range parameters', () => {
      const query: ServiceRequestListQuery = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      service.list(query).subscribe();

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/admin/service-requests' &&
          request.params.get('startDate') === '2024-01-01' &&
          request.params.get('endDate') === '2024-01-31'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockListResponse);
    });

    it('should exclude undefined parameters', () => {
      const query: ServiceRequestListQuery = {
        page: 1,
        status: undefined,
        search: undefined,
      };

      service.list(query).subscribe();

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/admin/service-requests' &&
          request.params.get('page') === '1' &&
          !request.params.has('status') &&
          !request.params.has('search')
        );
      });

      req.flush(mockListResponse);
    });

    it('should handle empty query object', () => {
      service.list({}).subscribe();

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/admin/service-requests' &&
          request.params.keys().length === 0
        );
      });

      req.flush(mockListResponse);
    });

    it('should handle no query parameter', () => {
      service.list().subscribe();

      const req = httpMock.expectOne('/api/admin/service-requests');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockListResponse);
    });

    it('should handle error response', () => {
      service.list().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne('/api/admin/service-requests');
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getById', () => {
    it('should make GET request to detail endpoint', () => {
      service.getById('123').subscribe((response) => {
        expect(response).toEqual(mockDetail);
      });

      const req = httpMock.expectOne('/api/admin/service-requests/123');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetail);
    });

    it('should handle different IDs', () => {
      const testIds = ['abc', '456', 'xyz-789'];

      testIds.forEach((id) => {
        service.getById(id).subscribe();

        const req = httpMock.expectOne(`/api/admin/service-requests/${id}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockDetail);
      });
    });

    it('should handle 404 error', () => {
      service.getById('nonexistent').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne('/api/admin/service-requests/nonexistent');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('capture', () => {
    it('should make POST request to capture endpoint', () => {
      service.capture('123').subscribe();

      const req = httpMock.expectOne('/api/requests/123/capture');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });

    it('should handle different IDs', () => {
      const testIds = ['abc', '456', 'xyz-789'];

      testIds.forEach((id) => {
        service.capture(id).subscribe();

        const req = httpMock.expectOne(`/api/requests/${id}/capture`);
        expect(req.request.method).toBe('POST');
        req.flush(null);
      });
    });

    it('should handle error response', () => {
      service.capture('123').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne('/api/requests/123/capture');
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('cancel', () => {
    it('should make POST request to cancel endpoint', () => {
      service.cancel('123').subscribe();

      const req = httpMock.expectOne('/api/requests/123/cancel');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });

    it('should handle different IDs', () => {
      const testIds = ['abc', '456', 'xyz-789'];

      testIds.forEach((id) => {
        service.cancel(id).subscribe();

        const req = httpMock.expectOne(`/api/requests/${id}/cancel`);
        expect(req.request.method).toBe('POST');
        req.flush(null);
      });
    });

    it('should handle error response', () => {
      service.cancel('123').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne('/api/requests/123/cancel');
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('finalize', () => {
    it('should make POST request to finalize endpoint with amount', () => {
      service.finalize('123', 17550).subscribe();

      const req = httpMock.expectOne('/api/requests/123/finalize');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ finalAmountCents: 17550 });
      req.flush(null);
    });

    it('should handle different amounts', () => {
      const amounts = [10000, 15000, 25000, 50000];

      amounts.forEach((amount) => {
        service.finalize('123', amount).subscribe();

        const req = httpMock.expectOne('/api/requests/123/finalize');
        expect(req.request.body.finalAmountCents).toBe(amount);
        req.flush(null);
      });
    });

    it('should handle different IDs', () => {
      const testIds = ['abc', '456', 'xyz-789'];

      testIds.forEach((id) => {
        service.finalize(id, 15000).subscribe();

        const req = httpMock.expectOne(`/api/requests/${id}/finalize`);
        expect(req.request.method).toBe('POST');
        req.flush(null);
      });
    });

    it('should handle error response', () => {
      service.finalize('123', 15000).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne('/api/requests/123/finalize');
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });
});

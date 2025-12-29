import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminServiceRequestsController } from './AdminServiceRequestsController';
import { AdminServiceRequestsService } from './AdminServiceRequestsService';
import { ServiceRequestStatus } from '../../service-requests/enums/service-request-status.enum';
import {
  ServiceRequestListQuery,
  ServiceRequestListResponse,
  AdminServiceRequestDetail,
} from './types';

describe('AdminServiceRequestsController', () => {
  let controller: AdminServiceRequestsController;

  const mockService = {
    list: jest.fn(),
    getById: jest.fn(),
  };

  const mockListResponse: ServiceRequestListResponse = {
    items: [
      {
        id: '123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
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
    workLogs: [],
    reviews: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminServiceRequestsController],
      providers: [
        {
          provide: AdminServiceRequestsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AdminServiceRequestsController>(
      AdminServiceRequestsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated list from service', async () => {
      mockService.list.mockResolvedValue(mockListResponse);

      const query: ServiceRequestListQuery = { page: 1, limit: 20 };
      const result = await controller.list(query);

      expect(result).toEqual(mockListResponse);
      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(mockService.list).toHaveBeenCalledTimes(1);
    });

    it('should pass query parameters to service', async () => {
      mockService.list.mockResolvedValue(mockListResponse);

      const query: ServiceRequestListQuery = {
        page: 2,
        limit: 10,
        status: ServiceRequestStatus.PENDING,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        search: 'john',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      };

      await controller.list(query);

      expect(mockService.list).toHaveBeenCalledWith(query);
    });

    it('should handle empty query parameters', async () => {
      mockService.list.mockResolvedValue({
        ...mockListResponse,
        items: [],
        pagination: { ...mockListResponse.pagination, total: 0 },
      });

      const query: ServiceRequestListQuery = {};
      const result = await controller.list(query);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(result.items).toEqual([]);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Database error');
      mockService.list.mockRejectedValue(error);

      const query: ServiceRequestListQuery = {};

      await expect(controller.list(query)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return service request detail from service', async () => {
      mockService.getById.mockResolvedValue(mockDetail);

      const result = await controller.getById('123');

      expect(result).toEqual(mockDetail);
      expect(mockService.getById).toHaveBeenCalledWith('123');
      expect(mockService.getById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when service returns null', async () => {
      mockService.getById.mockResolvedValue(null);

      await expect(controller.getById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getById('nonexistent')).rejects.toThrow(
        'Service request nonexistent not found',
      );
    });

    it('should include work logs in response', async () => {
      const detailWithLogs = {
        ...mockDetail,
        workLogs: [
          {
            id: 'wl1',
            createdAt: new Date('2024-01-02'),
            mechanicName: 'Mike Mechanic',
            hoursWorkedMinutes: 120,
            payoutPercentage: 70,
            notes: 'Fixed brakes',
          },
        ],
      };

      mockService.getById.mockResolvedValue(detailWithLogs);

      const result = await controller.getById('123');

      expect(result.workLogs).toHaveLength(1);
      expect(result.workLogs[0].mechanicName).toBe('Mike Mechanic');
    });

    it('should include reviews in response', async () => {
      const detailWithReviews = {
        ...mockDetail,
        reviews: [
          {
            id: 'rv1',
            createdAt: new Date('2024-01-03'),
            rating: 5,
            reviewerName: 'John Doe',
            reviewText: 'Great service!',
            mechanicId: 'mech1',
          },
        ],
      };

      mockService.getById.mockResolvedValue(detailWithReviews);

      const result = await controller.getById('123');

      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0].rating).toBe(5);
    });

    it('should handle different service request statuses', async () => {
      const statuses = [
        ServiceRequestStatus.PENDING,
        ServiceRequestStatus.AUTHORIZED,
        ServiceRequestStatus.CAPTURED,
        ServiceRequestStatus.CANCELLED,
        ServiceRequestStatus.FAILED,
        ServiceRequestStatus.FINALIZED,
      ];

      for (const status of statuses) {
        mockService.getById.mockResolvedValue({
          ...mockDetail,
          status,
        });

        const result = await controller.getById('123');
        expect(result.status).toBe(status);
      }
    });

    it('should propagate service errors', async () => {
      const error = new Error('Database error');
      mockService.getById.mockRejectedValue(error);

      await expect(controller.getById('123')).rejects.toThrow('Database error');
    });
  });
});

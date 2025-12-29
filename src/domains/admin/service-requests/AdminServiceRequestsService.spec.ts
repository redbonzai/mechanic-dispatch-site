/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminServiceRequestsService } from './AdminServiceRequestsService';
import { PrismaService } from '../../database/prisma.service';
import { ServiceRequestStatus } from '../../service-requests/enums/service-request-status.enum';

describe('AdminServiceRequestsService', () => {
  let service: AdminServiceRequestsService;

  const mockPrismaService = {
    serviceRequest: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockServiceRequest = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminServiceRequestsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminServiceRequestsService>(
      AdminServiceRequestsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated list of service requests', async () => {
      const mockItems = [mockServiceRequest];
      mockPrismaService.serviceRequest.count.mockResolvedValue(1);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue(mockItems);

      const result = await service.list({ page: 1, limit: 20 });

      expect(result).toEqual({
        items: mockItems,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      expect(mockPrismaService.serviceRequest.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(mockPrismaService.serviceRequest.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should handle custom page and limit', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(100);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({ page: 3, limit: 10 });

      expect(mockPrismaService.serviceRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should cap limit at 100', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({ page: 1, limit: 200 });

      expect(mockPrismaService.serviceRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });

    it('should use default page and limit when not provided', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({});

      expect(mockPrismaService.serviceRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({ status: ServiceRequestStatus.PENDING });

      expect(mockPrismaService.serviceRequest.count).toHaveBeenCalledWith({
        where: { status: ServiceRequestStatus.PENDING },
      });
    });

    it('should filter by date range', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrismaService.serviceRequest.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        },
      });
    });

    it('should filter by start date only', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({ startDate: '2024-01-01' });

      expect(mockPrismaService.serviceRequest.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2024-01-01'),
          },
        },
      });
    });

    it('should filter by end date only', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({ endDate: '2024-01-31' });

      expect(mockPrismaService.serviceRequest.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lte: new Date('2024-01-31'),
          },
        },
      });
    });

    it('should filter by search query', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({ search: 'john' });

      expect(mockPrismaService.serviceRequest.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should apply custom sort', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({ sortBy: 'amountCents', sortOrder: 'asc' });

      expect(mockPrismaService.serviceRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { amountCents: 'asc' },
        }),
      );
    });

    it('should combine multiple filters', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(0);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      await service.list({
        status: ServiceRequestStatus.PENDING,
        startDate: '2024-01-01',
        search: 'john',
      });

      expect(mockPrismaService.serviceRequest.count).toHaveBeenCalledWith({
        where: {
          status: ServiceRequestStatus.PENDING,
          createdAt: {
            gte: new Date('2024-01-01'),
          },
          OR: [
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should calculate pagination correctly', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(45);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      const result = await service.list({ page: 2, limit: 20 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 45,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should indicate no next page on last page', async () => {
      mockPrismaService.serviceRequest.count.mockResolvedValue(40);
      mockPrismaService.serviceRequest.findMany.mockResolvedValue([]);

      const result = await service.list({ page: 2, limit: 20 });

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return service request with work logs and reviews', async () => {
      const mockDetail = {
        ...mockServiceRequest,
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

      mockPrismaService.serviceRequest.findUnique.mockResolvedValue(mockDetail);

      const result = await service.getById('123');

      expect(result).toEqual(mockDetail);
      expect(mockPrismaService.serviceRequest.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          workLogs: {
            orderBy: { createdAt: 'desc' },
            select: expect.any(Object),
          },
          reviews: {
            orderBy: { createdAt: 'desc' },
            select: expect.any(Object),
          },
        },
      });
    });

    it('should return null when service request not found', async () => {
      mockPrismaService.serviceRequest.findUnique.mockResolvedValue(null);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('should include work logs ordered by creation date descending', async () => {
      const mockDetail = {
        ...mockServiceRequest,
        workLogs: [],
        reviews: [],
      };

      mockPrismaService.serviceRequest.findUnique.mockResolvedValue(mockDetail);

      await service.getById('123');

      expect(mockPrismaService.serviceRequest.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            workLogs: expect.objectContaining({
              orderBy: { createdAt: 'desc' },
            }),
          }),
        }),
      );
    });

    it('should include reviews ordered by creation date descending', async () => {
      const mockDetail = {
        ...mockServiceRequest,
        workLogs: [],
        reviews: [],
      };

      mockPrismaService.serviceRequest.findUnique.mockResolvedValue(mockDetail);

      await service.getById('123');

      expect(mockPrismaService.serviceRequest.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            reviews: expect.objectContaining({
              orderBy: { createdAt: 'desc' },
            }),
          }),
        }),
      );
    });
  });
});

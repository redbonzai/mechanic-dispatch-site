import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersController } from './AdminUsersController';
import { AdminUsersService } from './AdminUsersService';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let service: AdminUsersService;

  const mockAdminUsersService = {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAdminUser = {
    id: 'user123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
    isActive: true,
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: AdminUsersService,
          useValue: mockAdminUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
    service = module.get<AdminUsersService>(AdminUsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated list of admin users', async () => {
      const mockResponse = {
        items: [mockAdminUser],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockAdminUsersService.list.mockResolvedValue(mockResponse);

      const result = await controller.list({ page: 1, limit: 20 });

      expect(result).toEqual(mockResponse);

      expect(service.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('should pass query parameters to service', async () => {
      const query = {
        role: 'admin' as const,
        isActive: true,
        search: 'john',
      };
      mockAdminUsersService.list.mockResolvedValue({
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      await controller.list(query);

      expect(service.list).toHaveBeenCalledWith(query);
    });
  });

  describe('getById', () => {
    it('should return admin user by ID', async () => {
      mockAdminUsersService.getById.mockResolvedValue(mockAdminUser);

      const result = await controller.getById('user123');

      expect(result).toEqual(mockAdminUser);

      expect(service.getById).toHaveBeenCalledWith('user123');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockAdminUsersService.getById.mockResolvedValue(null);

      await expect(controller.getById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new admin user', async () => {
      const createDto = {
        email: 'newadmin@example.com',
        name: 'New Admin',
        password: 'password123',
        role: 'admin' as const,
      };
      mockAdminUsersService.create.mockResolvedValue(mockAdminUser);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockAdminUser);

      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should pass validation errors from service', async () => {
      const createDto = {
        email: 'invalid',
        name: 'A',
        password: 'short',
        role: 'admin' as const,
      };
      mockAdminUsersService.create.mockRejectedValue(
        new Error('Validation failed'),
      );

      await expect(controller.create(createDto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update admin user', async () => {
      const updateDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const updatedUser = { ...mockAdminUser, ...updateDto };
      mockAdminUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user123', updateDto);

      expect(result).toEqual(updatedUser);

      expect(service.update).toHaveBeenCalledWith('user123', updateDto);
    });

    it('should pass validation errors from service', async () => {
      mockAdminUsersService.update.mockRejectedValue(
        new Error('Validation failed'),
      );

      await expect(
        controller.update('user123', { name: 'A' }),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete admin user', async () => {
      mockAdminUsersService.delete.mockResolvedValue(undefined);

      await controller.delete('user123');

      expect(service.delete).toHaveBeenCalledWith('user123');
    });

    it('should pass errors from service', async () => {
      mockAdminUsersService.delete.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AdminUsersController);
      expect(guards).toBeDefined();

      expect(guards[0]).toBe(JwtAuthGuard);
    });
  });
});

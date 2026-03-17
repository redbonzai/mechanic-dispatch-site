import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersService } from './AdminUsersService';
import { PrismaService } from '../../database/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as validation from '../../../core/validation';

jest.mock('../../../core/validation');

describe('AdminUsersService', () => {
  let service: AdminUsersService;

  const mockPrismaService = {
    adminUser: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAdminUser = {
    id: 'user123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockPrismaService.adminUser.findUnique.mockReset();
    mockPrismaService.adminUser.findMany.mockReset();
    mockPrismaService.adminUser.count.mockReset();
    mockPrismaService.adminUser.create.mockReset();
    mockPrismaService.adminUser.update.mockReset();
    mockPrismaService.adminUser.delete.mockReset();
  });

  describe('list', () => {
    it('should return paginated list of admin users', async () => {
      const mockItems = [mockAdminUser];
      mockPrismaService.adminUser.count.mockResolvedValue(1);
      mockPrismaService.adminUser.findMany.mockResolvedValue(mockItems);

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

      expect(mockPrismaService.adminUser.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(mockPrismaService.adminUser.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should handle custom page and limit', async () => {
      mockPrismaService.adminUser.count.mockResolvedValue(100);
      mockPrismaService.adminUser.findMany.mockResolvedValue([]);

      await service.list({ page: 3, limit: 10 });

      expect(mockPrismaService.adminUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('should cap limit at 100', async () => {
      mockPrismaService.adminUser.count.mockResolvedValue(0);
      mockPrismaService.adminUser.findMany.mockResolvedValue([]);

      await service.list({ page: 1, limit: 200 });

      expect(mockPrismaService.adminUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('should use default page and limit when not provided', async () => {
      mockPrismaService.adminUser.count.mockResolvedValue(0);
      mockPrismaService.adminUser.findMany.mockResolvedValue([]);

      await service.list({});

      expect(mockPrismaService.adminUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should filter by role', async () => {
      mockPrismaService.adminUser.count.mockResolvedValue(0);
      mockPrismaService.adminUser.findMany.mockResolvedValue([]);

      await service.list({ role: 'super-admin' });

      expect(mockPrismaService.adminUser.count).toHaveBeenCalledWith({
        where: { role: 'super-admin' },
      });
    });

    it('should filter by isActive', async () => {
      mockPrismaService.adminUser.count.mockResolvedValue(0);
      mockPrismaService.adminUser.findMany.mockResolvedValue([]);

      await service.list({ isActive: false });

      expect(mockPrismaService.adminUser.count).toHaveBeenCalledWith({
        where: { isActive: false },
      });
    });

    it('should filter by search query (name or email)', async () => {
      mockPrismaService.adminUser.count.mockResolvedValue(0);
      mockPrismaService.adminUser.findMany.mockResolvedValue([]);

      await service.list({ search: 'john' });

      expect(mockPrismaService.adminUser.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should combine multiple filters', async () => {
      mockPrismaService.adminUser.count.mockResolvedValue(0);
      mockPrismaService.adminUser.findMany.mockResolvedValue([]);

      await service.list({ role: 'admin', isActive: true, search: 'test' });

      expect(mockPrismaService.adminUser.count).toHaveBeenCalledWith({
        where: {
          role: 'admin',
          isActive: true,
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'test', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should sort by specified field and order', async () => {
      mockPrismaService.adminUser.count.mockResolvedValue(0);
      mockPrismaService.adminUser.findMany.mockResolvedValue([]);

      await service.list({ sortBy: 'email', sortOrder: 'asc' });

      expect(mockPrismaService.adminUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { email: 'asc' } }),
      );
    });
  });

  describe('getById', () => {
    it('should return admin user by ID', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(mockAdminUser);

      const result = await service.getById('user123');

      expect(result).toEqual(mockAdminUser);
      expect(mockPrismaService.adminUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: expect.any(Object),
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(null);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDto = {
      email: 'newadmin@example.com',
      name: 'New Admin',
      password: 'password123',
      role: 'admin' as const,
    };

    beforeEach(() => {
      (validation.validateEmail as jest.Mock).mockReturnValue(true);
      (validation.validatePassword as jest.Mock).mockReturnValue(true);
      (validation.hashPassword as jest.Mock).mockResolvedValue(
        'hashed_password',
      );
    });

    it('should create a new admin user', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(null);
      mockPrismaService.adminUser.create.mockResolvedValue(mockAdminUser);

      const result = await service.create(createDto);

      expect(result).toEqual(mockAdminUser);
      expect(validation.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockPrismaService.adminUser.create).toHaveBeenCalledWith({
        data: {
          email: 'newadmin@example.com',
          name: 'New Admin',
          passwordHash: 'hashed_password',
          role: 'admin',
          isActive: true,
        },
        select: expect.any(Object),
      });
    });

    it('should use provided isActive value', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(null);
      mockPrismaService.adminUser.create.mockResolvedValue(mockAdminUser);

      await service.create({ ...createDto, isActive: false });

      expect(mockPrismaService.adminUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('should throw BadRequestException if required fields missing', async () => {
      await expect(
        service.create({ email: '', name: '', password: '', role: 'admin' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email invalid', async () => {
      (validation.validateEmail as jest.Mock).mockReturnValue(false);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password invalid', async () => {
      (validation.validatePassword as jest.Mock).mockReturnValue(false);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if name too short', async () => {
      await expect(service.create({ ...createDto, name: 'A' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if role invalid', async () => {
      await expect(
        service.create({ ...createDto, role: 'invalid' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(mockAdminUser);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (validation.validateEmail as jest.Mock).mockReturnValue(true);
      (validation.validatePassword as jest.Mock).mockReturnValue(true);
      (validation.hashPassword as jest.Mock).mockResolvedValue(
        'new_hashed_password',
      );
    });

    it('should update admin user', async () => {
      mockPrismaService.adminUser.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce(null);
      mockPrismaService.adminUser.update.mockResolvedValue({
        ...mockAdminUser,
        ...updateDto,
      });

      const result = await service.update('user123', updateDto);

      expect(result.name).toBe('Updated Name');
      expect(mockPrismaService.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: updateDto,
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should hash password if provided', async () => {
      mockPrismaService.adminUser.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce(null);
      mockPrismaService.adminUser.update.mockResolvedValue(mockAdminUser);

      await service.update('user123', { password: 'newpassword123' });

      expect(validation.hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(mockPrismaService.adminUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { passwordHash: 'new_hashed_password' },
        }),
      );
    });

    it('should validate email uniqueness when changing email', async () => {
      const userToUpdate = { ...mockAdminUser, email: 'old@example.com' };
      // First call: get user by ID
      mockPrismaService.adminUser.findUnique.mockResolvedValueOnce(
        userToUpdate,
      );
      // Second call: check if new email exists (returns a different user = conflict)
      mockPrismaService.adminUser.findUnique.mockResolvedValueOnce({
        ...mockAdminUser,
        id: 'other123',
        email: 'taken@example.com',
      });

      await expect(
        service.update('user123', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating to same email', async () => {
      // User's current email is already 'admin@example.com'
      // Updating to the same email should skip uniqueness check
      mockPrismaService.adminUser.findUnique.mockResolvedValueOnce(
        mockAdminUser,
      );
      mockPrismaService.adminUser.update.mockResolvedValueOnce(mockAdminUser);

      await service.update('user123', { email: mockAdminUser.email });

      expect(mockPrismaService.adminUser.update).toHaveBeenCalled();
      // Ensure findUnique was only called once (for getting user, not for uniqueness check)
      expect(mockPrismaService.adminUser.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if email invalid', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(mockAdminUser);
      (validation.validateEmail as jest.Mock).mockReturnValue(false);

      await expect(
        service.update('user123', { email: 'invalid' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password invalid', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(mockAdminUser);
      (validation.validatePassword as jest.Mock).mockReturnValue(false);

      await expect(
        service.update('user123', { password: 'short' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if name too short', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(mockAdminUser);

      await expect(service.update('user123', { name: 'A' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if role invalid', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(mockAdminUser);

      await expect(
        service.update('user123', { role: 'invalid' as any }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete admin user', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(mockAdminUser);
      mockPrismaService.adminUser.delete.mockResolvedValue(mockAdminUser);

      await service.delete('user123');

      expect(mockPrismaService.adminUser.delete).toHaveBeenCalledWith({
        where: { id: 'user123' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should prevent deleting last super-admin', async () => {
      const superAdmin = { ...mockAdminUser, role: 'super-admin' };
      mockPrismaService.adminUser.findUnique.mockResolvedValue(superAdmin);
      mockPrismaService.adminUser.count.mockResolvedValue(1);

      await expect(service.delete('user123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow deleting super-admin if not the last one', async () => {
      const superAdmin = { ...mockAdminUser, role: 'super-admin' };
      mockPrismaService.adminUser.findUnique.mockResolvedValue(superAdmin);
      mockPrismaService.adminUser.count.mockResolvedValue(2);
      mockPrismaService.adminUser.delete.mockResolvedValue(superAdmin);

      await service.delete('user123');

      expect(mockPrismaService.adminUser.delete).toHaveBeenCalled();
    });

    it('should allow deleting non-super-admin without checking count', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(mockAdminUser);
      mockPrismaService.adminUser.delete.mockResolvedValue(mockAdminUser);

      await service.delete('user123');

      expect(mockPrismaService.adminUser.count).not.toHaveBeenCalled();
      expect(mockPrismaService.adminUser.delete).toHaveBeenCalled();
    });
  });
});

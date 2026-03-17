/**
 * AdminAuthService Unit Tests
 *
 * TDD: Tests written FIRST before implementation
 * Pattern: AAA (Arrange-Act-Assert)
 * Coverage Target: 90% (unit tests are 80% of test pyramid)
 *
 * @authority docs/admin/TEST_STRATEGY.md
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminAuthService } from './AdminAuthService';
import { PrismaService } from '../../database/prisma.service';
import * as validation from '../../../core/validation';

describe('AdminAuthService (Unit Tests - 80%)', () => {
  let service: AdminAuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    // Arrange: Setup test module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        {
          provide: PrismaService,
          useValue: {
            adminUser: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            adminRefreshToken: {
              findUnique: jest.fn(),
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens and user for valid credentials', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'password123' };
      const hashedPassword = await validation.hashPassword('password123');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');
      jest.spyOn(prisma.adminUser, 'update').mockResolvedValue(mockUser);
      jest.spyOn(prisma.adminRefreshToken, 'create').mockResolvedValue({
        id: 'token123',
        userId: 'user123',
        token: 'mock-refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.tokens.accessToken).toBe('mock-token');
      expect(result.tokens.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe('admin@test.com');
      expect(result.user.role).toBe('admin');
      expect(result.user).not.toHaveProperty('passwordHash');

      expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
      });
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      // Arrange
      const loginDto = { email: 'invalid@test.com', password: 'password123' };
      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'wrongpassword' };
      const hashedPassword = await validation.hashPassword('correctpassword');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.adminUser, 'update').mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw BadRequestException for missing email (fail-fast)', async () => {
      // Arrange
      const loginDto = { email: '', password: 'password123' };

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Email and password are required',
      );
    });

    it('should throw BadRequestException for missing password (fail-fast)', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: '' };

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Email and password are required',
      );
    });

    it('should throw BadRequestException for invalid email format (fail-fast)', async () => {
      // Arrange
      const loginDto = { email: 'invalid-email', password: 'password123' };

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email format',
      );
    });

    it('should throw BadRequestException for password < 8 chars (fail-fast)', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: '1234567' };

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'password123' };
      const hashedPassword = await validation.hashPassword('password123');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: false, // Inactive
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Account is inactive',
      );
    });

    it('should throw UnauthorizedException for locked account (5 failed attempts)', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'password123' };
      const hashedPassword = await validation.hashPassword('password123');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 5, // Locked
        lastFailedLoginAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Account is locked',
      );
    });

    it('should allow login after lockout period expires (15 minutes)', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'password123' };
      const hashedPassword = await validation.hashPassword('password123');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 5,
        lastFailedLoginAt: new Date(Date.now() - 16 * 60 * 1000), // 16 min ago (expired)
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');
      jest.spyOn(prisma.adminUser, 'update').mockResolvedValue(mockUser);
      jest.spyOn(prisma.adminRefreshToken, 'create').mockResolvedValue({
        id: 'token123',
        userId: 'user123',
        token: 'mock-refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.user.email).toBe('admin@test.com');
    });

    it('should increment failedLoginAttempts on failed login', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'wrongpassword' };
      const hashedPassword = await validation.hashPassword('correctpassword');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 2,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.adminUser, 'update').mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 3,
        lastFailedLoginAt: new Date(),
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();

      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: {
          failedLoginAttempts: { increment: 1 },

          lastFailedLoginAt: expect.any(Date),
        },
      });
    });

    it('should reset failedLoginAttempts on successful login', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'password123' };
      const hashedPassword = await validation.hashPassword('password123');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 3, // Has previous failures
        lastFailedLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');
      jest.spyOn(prisma.adminUser, 'update').mockResolvedValue(mockUser);
      jest.spyOn(prisma.adminRefreshToken, 'create').mockResolvedValue({
        id: 'token123',
        userId: 'user123',
        token: 'mock-refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      // Act
      await service.login(loginDto);

      // Assert

      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: {
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
        },
      });
    });

    it('should store refresh token in database', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'password123' };
      const hashedPassword = await validation.hashPassword('password123');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-refresh-token');
      jest.spyOn(prisma.adminUser, 'update').mockResolvedValue(mockUser);
      jest.spyOn(prisma.adminRefreshToken, 'create').mockResolvedValue({
        id: 'token123',
        userId: 'user123',
        token: 'mock-refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      // Act
      await service.login(loginDto);

      // Assert

      expect(prisma.adminRefreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          token: 'mock-refresh-token',

          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const mockPayload = {
        sub: 'user123',
        email: 'admin@test.com',
        role: 'admin',
      };
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: 'hash',
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockTokenRecord = {
        id: 'token123',
        userId: 'user123',
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid
        createdAt: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      jest
        .spyOn(prisma.adminRefreshToken, 'findUnique')
        .mockResolvedValue(mockTokenRecord);
      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('new-access-token');

      // Act
      const result = await service.refresh(refreshToken);

      // Assert
      expect(result.accessToken).toBe('new-access-token');

      expect(jwt.verify).toHaveBeenCalledWith(refreshToken);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 'user123', email: 'admin@test.com', role: 'admin' },
        { expiresIn: '15m' },
      );
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange
      const refreshToken = 'invalid-token';
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw BadRequestException for missing refresh token (fail-fast)', async () => {
      // Arrange
      const refreshToken = '';

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'Refresh token is required',
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      // Arrange
      const refreshToken = 'expired-token';
      const mockPayload = {
        sub: 'user123',
        email: 'admin@test.com',
        role: 'admin',
      };
      const mockTokenRecord = {
        id: 'token123',
        userId: 'user123',
        token: refreshToken,
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      jest
        .spyOn(prisma.adminRefreshToken, 'findUnique')
        .mockResolvedValue(mockTokenRecord);

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should throw UnauthorizedException if refresh token not found in database', async () => {
      // Arrange
      const refreshToken = 'valid-token';
      const mockPayload = {
        sub: 'user123',
        email: 'admin@test.com',
        role: 'admin',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      jest
        .spyOn(prisma.adminRefreshToken, 'findUnique')
        .mockResolvedValue(null);

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      // Arrange
      const refreshToken = 'valid-token';
      const mockPayload = {
        sub: 'user123',
        email: 'admin@test.com',
        role: 'admin',
      };
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: 'hash',
        role: 'admin',
        isActive: false, // Inactive
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockTokenRecord = {
        id: 'token123',
        userId: 'user123',
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      jest
        .spyOn(prisma.adminRefreshToken, 'findUnique')
        .mockResolvedValue(mockTokenRecord);
      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'User not found or inactive',
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const refreshToken = 'valid-token';
      const mockPayload = {
        sub: 'user123',
        email: 'admin@test.com',
        role: 'admin',
      };
      const mockTokenRecord = {
        id: 'token123',
        userId: 'user123',
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      jest
        .spyOn(prisma.adminRefreshToken, 'findUnique')
        .mockResolvedValue(mockTokenRecord);
      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should invalidate refresh token', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      jest
        .spyOn(prisma.adminRefreshToken, 'deleteMany')
        .mockResolvedValue({ count: 1 });

      // Act
      await service.logout(refreshToken);

      // Assert

      expect(prisma.adminRefreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
    });

    it('should not throw error if token does not exist', async () => {
      // Arrange
      const refreshToken = 'non-existent-token';
      jest
        .spyOn(prisma.adminRefreshToken, 'deleteMany')
        .mockResolvedValue({ count: 0 });

      // Act & Assert
      await expect(service.logout(refreshToken)).resolves.not.toThrow();

      expect(prisma.adminRefreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
    });

    it('should handle empty refresh token gracefully', async () => {
      // Arrange
      const refreshToken = '';

      // Act & Assert
      await expect(service.logout(refreshToken)).resolves.not.toThrow();
      // Should return early without calling database
    });
  });

  describe('validateUser', () => {
    it('should return user for valid JWT payload', async () => {
      // Arrange
      const payload = {
        sub: 'user123',
        email: 'admin@test.com',
        role: 'admin',
      };
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: 'hash',
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser(payload);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result?.id).toBe('user123');
      expect(result?.email).toBe('admin@test.com');
      expect(result?.role).toBe('admin');
      expect(result).not.toHaveProperty('passwordHash');

      expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
      });
    });

    it('should return null for invalid user ID', async () => {
      // Arrange
      const payload = {
        sub: 'invalid-user-id',
        email: 'admin@test.com',
        role: 'admin',
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await service.validateUser(payload);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      // Arrange
      const payload = {
        sub: 'user123',
        email: 'admin@test.com',
        role: 'admin',
      };
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: 'hash',
        role: 'admin',
        isActive: false, // Inactive
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser(payload);

      // Assert
      expect(result).toBeNull();
    });
  });
});

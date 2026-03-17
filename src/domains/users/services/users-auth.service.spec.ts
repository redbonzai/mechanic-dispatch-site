import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersAuthService } from './users-auth.service';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersAuthService', () => {
  let service: UsersAuthService;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user_1',
    email: 'user@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date('2024-01-01'),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userRefreshToken: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendMechanicWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersAuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<UsersAuthService>(UsersAuthService);
    void module.get(PrismaService);
    jwtService = module.get(JwtService);
    void module.get(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.userRefreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'user@example.com',
        name: 'Test User',
        password: 'Password1!',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('user@example.com');
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'user@example.com' }),
        }),
      );
    });

    it('should lowercase the email on registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user_2',
        email: 'upper@example.com',
        name: 'User',
        createdAt: new Date(),
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.userRefreshToken.create.mockResolvedValue({});

      await service.register({
        email: 'UPPER@example.com',
        name: 'User',
        password: 'Password1!',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'upper@example.com' }),
        }),
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'user@example.com',
          name: 'Test',
          password: 'Password1!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should send a verification email after registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.userRefreshToken.create.mockResolvedValue({});
      jwtService.sign.mockReturnValue('verify-token');

      await service.register({
        email: 'user@example.com',
        name: 'Test User',
        password: 'Password1!',
      });

      // Allow the non-blocking verification email to fire
      await new Promise((r) => setTimeout(r, 10));
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.userRefreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'user@example.com',
        password: 'Password1!',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'Password1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'Password1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── verifyEmail ───────────────────────────────────────────────────────────

  describe('verifyEmail', () => {
    it('should mark email as verified for valid token', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user_1',
        purpose: 'verify-email',
        type: 'user',
      });
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        isEmailVerified: true,
      });

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toBe('Email verified successfully');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        data: { isEmailVerified: true },
      });
    });

    it('should throw BadRequestException for expired or invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for wrong token purpose', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user_1',
        purpose: 'password-reset',
        type: 'user',
      });

      await expect(service.verifyEmail('wrong-purpose-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for mechanic token used on user endpoint', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'mech_1',
        purpose: 'verify-email',
        type: 'mechanic',
      });

      await expect(service.verifyEmail('mechanic-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── resendVerification ─────────────────────────────────────────────────────

  describe('resendVerification', () => {
    it('should resend verification email for unverified user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        email: mockUser.email,
        name: mockUser.name,
        isEmailVerified: false,
      });
      jwtService.sign.mockReturnValue('new-verify-token');

      await service.resendVerification(mockUser.id);

      await new Promise((r) => setTimeout(r, 10));
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        email: mockUser.email,
        name: mockUser.name,
        isEmailVerified: true,
      });

      await expect(service.resendVerification(mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.resendVerification('non-existent')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should delete all refresh tokens for the user', async () => {
      mockPrisma.userRefreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await service.logout(mockUser.id);

      expect(mockPrisma.userRefreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });
});

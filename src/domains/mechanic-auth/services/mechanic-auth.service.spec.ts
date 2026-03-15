import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MechanicAuthService } from './mechanic-auth.service';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('MechanicAuthService', () => {
  let service: MechanicAuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockMechanic = {
    id: 'mech_1',
    email: 'mechanic@example.com',
    name: 'Jane Wrench',
    slug: 'jane-wrench',
    passwordHash: 'hashed-password',
    isActive: false,
    isEmailVerified: false,
    location: 'Austin, TX',
    subscriptionStatus: 'INACTIVE' as const,
    subscriptionTier: null,
  };

  const mockPrisma = {
    mechanic: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    mechanicRefreshToken: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    mechanicSkill: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
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
        MechanicAuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<MechanicAuthService>(MechanicAuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should create mechanic and return tokens', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValueOnce(null); // email check
      mockPrisma.mechanic.findUnique.mockResolvedValueOnce(null); // slug check
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.mechanic.create.mockResolvedValue({
        id: mockMechanic.id,
        email: mockMechanic.email,
        name: mockMechanic.name,
        slug: mockMechanic.slug,
        subscriptionStatus: 'INACTIVE',
      });
      mockPrisma.mechanicRefreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'mechanic@example.com',
        password: 'Password1!',
        name: 'Jane Wrench',
        location: 'Austin, TX',
        yearsExperience: 5,
      });

      expect(result.accessToken).toBeDefined();
      expect(result.mechanic.email).toBe('mechanic@example.com');
    });

    it('should set mechanic isActive=false on registration', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValueOnce(null);
      mockPrisma.mechanic.findUnique.mockResolvedValueOnce(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.mechanic.create.mockResolvedValue({
        id: 'mech_new',
        email: 'new@example.com',
        name: 'New',
        slug: 'new',
        subscriptionStatus: 'INACTIVE',
      });
      mockPrisma.mechanicRefreshToken.create.mockResolvedValue({});

      await service.register({
        email: 'new@example.com',
        password: 'Password1!',
        name: 'New',
        location: 'Dallas, TX',
        yearsExperience: 2,
      });

      expect(mockPrisma.mechanic.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('should throw BadRequestException if email already registered', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValueOnce(mockMechanic);

      await expect(
        service.register({
          email: 'mechanic@example.com',
          password: 'Password1!',
          name: 'Jane',
          location: 'Austin, TX',
          yearsExperience: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should send welcome/verification email after registration', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValueOnce(null);
      mockPrisma.mechanic.findUnique.mockResolvedValueOnce(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.mechanic.create.mockResolvedValue({
        id: 'mech_2',
        email: 'jane@example.com',
        name: 'Jane',
        slug: 'jane',
        subscriptionStatus: 'INACTIVE',
      });
      mockPrisma.mechanicRefreshToken.create.mockResolvedValue({});

      await service.register({
        email: 'jane@example.com',
        password: 'Password1!',
        name: 'Jane',
        location: 'TX',
        yearsExperience: 3,
      });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockMailService.sendMechanicWelcomeEmail).toHaveBeenCalled();
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValue(mockMechanic);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.mechanicRefreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'mechanic@example.com',
        password: 'Password1!',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.mechanic.id).toBe(mockMechanic.id);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValue(mockMechanic);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'mechanic@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'Password1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when mechanic has no password set', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValue({
        ...mockMechanic,
        passwordHash: null,
      });

      await expect(
        service.login({ email: 'mechanic@example.com', password: 'Password1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── verifyEmail ───────────────────────────────────────────────────────────

  describe('verifyEmail', () => {
    it('should verify email for valid mechanic token', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'mech_1',
        purpose: 'verify-email',
        type: 'mechanic',
      });
      mockPrisma.mechanic.update.mockResolvedValue({
        ...mockMechanic,
        isEmailVerified: true,
      });

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toBe('Email verified successfully');
      expect(mockPrisma.mechanic.update).toHaveBeenCalledWith({
        where: { id: 'mech_1' },
        data: { isEmailVerified: true },
      });
    });

    it('should throw BadRequestException for invalid or expired token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject user-type token on mechanic endpoint', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user_1',
        purpose: 'verify-email',
        type: 'user',
      });

      await expect(service.verifyEmail('user-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should delete all refresh tokens for the mechanic', async () => {
      mockPrisma.mechanicRefreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout(mockMechanic.id);

      expect(mockPrisma.mechanicRefreshToken.deleteMany).toHaveBeenCalledWith({
        where: { mechanicId: mockMechanic.id },
      });
    });
  });

  // ── updateProfile ─────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should update profile fields', async () => {
      mockPrisma.mechanic.update.mockResolvedValue({
        id: 'mech_1',
        name: 'Jane Updated',
        bio: 'New bio',
        shopName: 'Jane Shop',
        phone: '555-1234',
        website: 'https://jane.com',
        location: 'Austin, TX',
        yearsExperience: 6,
        certifications: [],
        skills: [],
      });

      const result = await service.updateProfile('mech_1', {
        name: 'Jane Updated',
        bio: 'New bio',
      });

      expect(result.name).toBe('Jane Updated');
      expect(mockPrisma.mechanic.update).toHaveBeenCalled();
    });

    it('should replace skills when skillIds provided', async () => {
      mockPrisma.mechanicSkill.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.mechanicSkill.createMany.mockResolvedValue({ count: 3 });
      mockPrisma.mechanic.update.mockResolvedValue({
        id: 'mech_1',
        name: 'Jane',
        bio: null,
        shopName: null,
        phone: null,
        website: null,
        location: 'Austin, TX',
        yearsExperience: 5,
        certifications: [],
        skills: [],
      });

      await service.updateProfile('mech_1', {
        skillIds: ['skill_a', 'skill_b', 'skill_c'],
      });

      expect(mockPrisma.mechanicSkill.deleteMany).toHaveBeenCalledWith({
        where: { mechanicId: 'mech_1' },
      });
      expect(mockPrisma.mechanicSkill.createMany).toHaveBeenCalledWith({
        data: [
          { mechanicId: 'mech_1', skillId: 'skill_a' },
          { mechanicId: 'mech_1', skillId: 'skill_b' },
          { mechanicId: 'mech_1', skillId: 'skill_c' },
        ],
        skipDuplicates: true,
      });
    });
  });
});

/**
 * AdminAuthService - Admin authentication operations
 * Security: bcrypt (cost 12), JWT tokens, account lockout (5 attempts, 15 min)
 * @module domains/admin/auth
 */

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as validation from '../../../core/validation';
import * as auth from '../../../core/auth';
import { LoginResponse, AdminUserResponse, RefreshResponse } from './types';
import { LoginDto } from './dtos';

/** Admin authentication service (SOLID compliant) */
@Injectable()
export class AdminAuthService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_FAILED_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Authenticate admin user */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    // Fail-fast validation (SOLID S principle: Single Responsibility)
    this.validateLoginDto(loginDto);

    // Find user by email
    const user = await this.prisma.adminUser.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (this.isAccountLocked(user)) {
      throw new UnauthorizedException(
        'Account is locked due to too many failed attempts',
      );
    }

    // Verify password
    const isPasswordValid = await validation.comparePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Reset failed login attempts on successful login
    await this.resetFailedLoginAttempts(user.id);

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Save refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      tokens,
      user: this.mapUserToResponse(user),
    };
  }

  /** Refresh access token using refresh token */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    // Fail-fast validation
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Verify refresh token
    let payload: auth.JwtPayload;
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const tokenRecord = await this.prisma.adminRefreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Validate user still exists and is active
    const user = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new access token
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.ACCESS_TOKEN_EXPIRY },
    );

    return { accessToken };
  }

  /** Logout admin user (invalidate refresh token) */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return; // Already logged out
    }

    // Delete refresh token from database
    await this.prisma.adminRefreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /** Validate user from JWT payload (for JwtStrategy) */
  async validateUser(
    payload: auth.JwtPayload,
  ): Promise<AdminUserResponse | null> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return this.mapUserToResponse(user);
  }

  /** Validate login DTO (fail-fast) */
  private validateLoginDto(loginDto: LoginDto): void {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    if (!validation.validateEmail(loginDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!validation.validatePassword(loginDto.password)) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }

  /** Generate JWT tokens (access + refresh) */
  private generateTokens(user: {
    id: string;
    email: string;
    role: string;
  }): auth.AuthTokens {
    const payload: auth.JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  /** Save refresh token to database */
  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.adminRefreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /** Increment failed login attempts */
  private async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await this.prisma.adminUser.updateMany({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLoginAt: new Date(),
      },
    });
  }

  /** Reset failed login attempts */
  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.prisma.adminUser.updateMany({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      },
    });
  }

  /** Check if account is locked */
  private isAccountLocked(user: {
    failedLoginAttempts: number;
    lastFailedLoginAt: Date | null;
  }): boolean {
    if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
      if (!user.lastFailedLoginAt) {
        return true;
      }

      const lockoutEnd = new Date(
        user.lastFailedLoginAt.getTime() + this.LOCKOUT_DURATION_MS,
      );

      return new Date() < lockoutEnd;
    }

    return false;
  }

  /** Map user entity to response DTO (excludes passwordHash) */
  private mapUserToResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AdminUserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AdminUserResponse['role'],
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

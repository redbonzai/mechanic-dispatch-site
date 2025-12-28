/**
 * JWT Strategy for Passport
 *
 * Validates JWT tokens and attaches user to request.
 *
 * @module domains/admin/auth
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AdminAuthService } from './AdminAuthService';
import * as auth from '../../../core/auth';

/**
 * JWT Strategy for admin authentication.
 *
 * Validates JWT tokens from Authorization header.
 * Calls AdminAuthService.validateUser() to verify user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('JWT_SECRET') ||
        'default-secret-key-change-in-production',
    });
  }

  /**
   * Validate JWT payload.
   *
   * Called automatically by Passport after JWT verification.
   *
   * @param payload - Decoded JWT payload
   * @returns User object or throws UnauthorizedException
   */
  async validate(payload: auth.JwtPayload) {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}

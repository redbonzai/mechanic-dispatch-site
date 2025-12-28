/**
 * JWT Auth Guard
 *
 * Protects routes by requiring valid JWT authentication.
 *
 * @module domains/admin/auth
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard for admin routes.
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 *
 * Validates JWT token and attaches user to request.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('admin-jwt') {
  /**
   * Can activate route.
   *
   * @param context - Execution context
   * @returns True if authorized, false otherwise
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

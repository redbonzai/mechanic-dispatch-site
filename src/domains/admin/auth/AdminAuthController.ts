/**
 * AdminAuthController - Admin authentication REST API endpoints
 * @module domains/admin/auth
 */

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminAuthService } from './AdminAuthService';
import { LoginDto } from './dtos';
import {
  LoginDtoValidator,
  RefreshDtoValidator,
  LogoutDtoValidator,
} from './admin.validator';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Admin authentication controller.
 *
 * Endpoints:
 * - POST /admin/auth/login - Authenticate admin user
 * - POST /admin/auth/refresh - Refresh access token
 * - POST /admin/auth/logout - Logout admin user
 * - GET /admin/auth/profile - Get current user profile
 */
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  /**
   * Login endpoint.
   *
   * @param loginDto - Email and password (validated)
   * @returns Access token, refresh token, and user profile
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDtoValidator) {
    return this.authService.login(loginDto as LoginDto);
  }

  /**
   * Refresh token endpoint.
   *
   * @param refreshDto - Refresh token (validated)
   * @returns New access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDtoValidator) {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  /**
   * Logout endpoint.
   *
   * @param logoutDto - Refresh token to invalidate (validated)
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDtoValidator) {
    await this.authService.logout(logoutDto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile endpoint.
   *
   * Protected route - requires JWT authentication.
   *
   * @param req - Request with user attached by JWT guard
   * @returns User profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: { user: unknown }): unknown {
    return req.user;
  }
}

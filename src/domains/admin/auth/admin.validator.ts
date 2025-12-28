/**
 * Admin Auth Validators
 *
 * Fail-fast validation using class-validator decorators.
 * These validators are applied to DTOs in the controller.
 *
 * @module domains/admin/auth
 */

import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

/**
 * Login DTO Validator
 *
 * Fail-fast validation for login requests.
 */
export class LoginDtoValidator {
  @IsNotEmpty({ message: 'Email and password are required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Email and password are required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsString()
  password: string;
}

/**
 * Refresh DTO Validator
 *
 * Fail-fast validation for refresh token requests.
 */
export class RefreshDtoValidator {
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString()
  refreshToken: string;
}

/**
 * Logout DTO Validator
 *
 * Fail-fast validation for logout requests.
 */
export class LogoutDtoValidator {
  @IsString()
  refreshToken: string;
}

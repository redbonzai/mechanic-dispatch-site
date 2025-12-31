/**
 * Create Admin User DTO
 * @module domains/admin/users/dtos
 */

import { AdminRole } from '../../auth/types';

export class CreateAdminUserDto {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
  isActive?: boolean;
}

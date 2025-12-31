/**
 * Update Admin User DTO
 * @module domains/admin/users/dtos
 */

import { AdminRole } from '../../auth/types';

export class UpdateAdminUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: AdminRole;
  isActive?: boolean;
}

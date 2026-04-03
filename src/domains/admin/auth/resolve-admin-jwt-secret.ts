import { ConfigService } from '@nestjs/config';

export const ADMIN_JWT_FALLBACK_SECRET = 'default-secret-key-change-in-production';

/**
 * Single source for admin JWT signing + verification.
 * `??` vs `||` mismatch caused 401s when JWT_SECRET was "" (sign with "", verify with fallback).
 */
export function resolveAdminJwtSecret(config: ConfigService): string {
  const raw = config.get<string>('JWT_SECRET');
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }
  return ADMIN_JWT_FALLBACK_SECRET;
}

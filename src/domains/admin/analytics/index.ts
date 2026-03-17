/**
 * Admin Analytics Module
 *
 * Barrel export for analytics module following constitutional requirements.
 *
 * References:
 * - CLAUDE.md: Module layout (types.ts / functions.ts / PascalCase.ts / index.ts)
 * - docs/standards/common/modules.md: Barrel exports encouraged inside module boundary
 */

// Export all types
export * from './types';

// Export service (and all exported interfaces) and controller
export * from './AdminAnalyticsService';
export { AdminAnalyticsController } from './AdminAnalyticsController';

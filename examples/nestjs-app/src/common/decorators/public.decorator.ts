import { SetMetadata } from '@nestjs/common';

/**
 * Mark a controller or handler as publicly accessible — the global AuthGuard
 * will skip authentication for any route decorated with @Public().
 *
 * @example
 *   @Public()
 *   @Get('health')
 *   check() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

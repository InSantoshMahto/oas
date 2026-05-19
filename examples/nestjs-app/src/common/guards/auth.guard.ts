import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/** Shape of the user object stored on request.user */
export interface AuthUser {
  id: number;
  username: string;
  roles: string[];
}

/**
 * Global authentication guard.
 *
 * Supports two authentication strategies (checked in order):
 *
 * 1. **API Key** — `X-API-KEY: <key>` header.
 *    Valid keys: `demo-key-123` (read-only), `admin-key-456` (admin).
 *
 * 2. **JWT Bearer** — `Authorization: Bearer <token>` header.
 *    Valid tokens are issued by AuthService.login().
 *
 * Routes decorated with @Public() bypass this guard entirely.
 *
 * > **Note:** This is a simplified, in-memory implementation for demo
 * > purposes. In production replace with passport-jwt or similar.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /** Hardcoded valid API keys (replace with DB/cache lookup in production) */
  private static readonly API_KEYS: Record<string, AuthUser> = {
    'demo-key-123': { id: 0, username: 'api-readonly', roles: ['reader'] },
    'admin-key-456': { id: 0, username: 'api-admin',   roles: ['admin'] },
  };

  /** Tokens issued by AuthService are registered here at runtime */
  static readonly ACTIVE_TOKENS = new Map<string, AuthUser>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ── @Public() bypass ────────────────────────────────────────────────
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();

    // ── Strategy 1: API Key ──────────────────────────────────────────────
    const apiKey = request.headers['x-api-key'] as string | undefined;
    if (apiKey) {
      const user = AuthGuard.API_KEYS[apiKey];
      if (!user) throw new UnauthorizedException('Invalid API key');
      request.user = user;
      return true;
    }

    // ── Strategy 2: JWT Bearer ───────────────────────────────────────────
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const user  = AuthGuard.ACTIVE_TOKENS.get(token);
      if (!user) throw new UnauthorizedException('Invalid or expired token');
      request.user = user;
      return true;
    }

    throw new UnauthorizedException(
      'Authentication required. Provide a Bearer token or X-API-KEY header.',
    );
  }
}

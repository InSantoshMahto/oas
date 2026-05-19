import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator that injects the authenticated user object (set by
 * AuthGuard onto request.user) directly into a handler argument.
 *
 * @example
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: AuthUser) { return user; }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

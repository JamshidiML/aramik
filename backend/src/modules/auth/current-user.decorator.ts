import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The authenticated user's id, attached to the request by JwtAuthGuard.
 * Use this instead of trusting any userId on the request body/query.
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{ userId: string }>();
  return request.userId;
});

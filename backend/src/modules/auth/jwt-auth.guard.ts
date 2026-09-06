import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = { sub: string };
type RequestWithUser = { headers: { authorization?: string }; userId?: string };

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the authenticated
 * user's id to the request as `request.userId`. Every endpoint that reads or writes
 * mood/meditation data must use this guard — see CLAUDE.md "GDPR consent is enforced
 * server-side" for why userId must never come from the client body/query instead.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

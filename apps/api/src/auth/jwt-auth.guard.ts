// Decodes the bearer JWT into req.session. @Public() routes skip the check.
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../common/decorators";
import type { JwtClaims, OxRequest } from "../common/session";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<OxRequest>();
    const token = this.bearer(req);

    // Always try to attach a session (public routes still personalize when signed in).
    if (token) {
      try {
        const claims = await this.jwt.verifyAsync<JwtClaims>(token);
        req.session = this.auth.sessionFromClaims(claims);
      } catch {
        // fall through; required-auth routes reject below
      }
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    if (!req.session) {
      throw new UnauthorizedException({ code: "unauthorized", message: "Bearer token required." });
    }
    return true;
  }

  private bearer(req: OxRequest): string | null {
    const h = req.headers.authorization;
    if (!h) return null;
    const [scheme, value] = h.split(" ");
    return scheme?.toLowerCase() === "bearer" && value ? value : null;
  }
}

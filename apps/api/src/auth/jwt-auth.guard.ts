// Decodes the bearer token into req.session. @Public() routes skip the check.
//
// Two token kinds are accepted:
//   - an OX-minted JWT (this API signed it; claims { userId, role, floorId }) —
//     verified with the shared JWT secret;
//   - a Supabase access token (issued by Supabase Auth) — verified/decoded via
//     SupabaseBridge and resolved to an OX User through User.authUserId.
//
// Revoked tokens (server-side denylist, populated on signout) are rejected even
// when otherwise valid.
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
import { SupabaseBridge } from "../common/supabase.bridge";
import { TokenDenylist } from "../common/token-denylist";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
    private readonly supabase: SupabaseBridge,
    private readonly denylist: TokenDenylist,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<OxRequest>();
    const token = this.bearer(req);

    if (token) {
      req.accessToken = token;
      if (this.denylist.isDenied(token)) {
        // A signed-out token must not authenticate anything.
        throw new UnauthorizedException({ code: "unauthorized", message: "Session ended. Sign in again." });
      }
      try {
        if (this.supabase.isSupabaseToken(token)) {
          req.session = await this.supabase.sessionFromSupabaseToken(token);
          req.isSupabaseToken = true;
        } else {
          const claims = await this.jwt.verifyAsync<JwtClaims>(token);
          req.session = this.auth.sessionFromClaims(claims);
        }
      } catch (err) {
        // Supabase bridge throws a structured 401 on a genuinely bad token; let
        // that surface. An OX-JWT verify failure just falls through so public
        // routes still work unauthenticated.
        if (err instanceof UnauthorizedException && this.supabase.isSupabaseToken(token)) throw err;
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

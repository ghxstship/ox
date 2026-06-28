// Decodes the bearer (a Supabase access token) into req.session + req.accessToken.
// @Public() routes skip the session requirement but still attach the token when
// present (so e.g. /products can personalize, and /auth/signout can revoke).
//
// The token is verified/decoded via SupabaseBridge and resolved to an OX User
// through User.authUserId. Revoked tokens (server-side denylist, populated on
// signout) are rejected even when otherwise valid.
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../common/decorators";
import type { OxRequest } from "../common/session";
import { SupabaseBridge } from "../common/supabase.bridge";
import { TokenDenylist } from "../common/token-denylist";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseBridge,
    private readonly denylist: TokenDenylist,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<OxRequest>();
    const token = this.bearer(req);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (token) {
      req.accessToken = token;
      if (this.denylist.isDenied(token)) {
        // A signed-out token must not authenticate anything.
        throw new UnauthorizedException({ code: "unauthorized", message: "Session ended. Sign in again." });
      }
      try {
        req.session = await this.supabase.sessionFromToken(token);
        req.isSupabaseToken = true;
      } catch (err) {
        // On a non-public route a bad token is fatal. On a public route we let
        // the request through unauthenticated (no session attached).
        if (!isPublic) throw err;
      }
    }

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

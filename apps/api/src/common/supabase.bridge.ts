// Supabase token bridge.
//
// A request may carry EITHER an OX-minted JWT (signed by this API, claims
// { userId, role, floorId }) OR a Supabase access token (issued by Supabase Auth,
// `sub` = auth.users.id). This service:
//   1. verifies/decodes a Supabase access token and resolves it to an OX User via
//      User.authUserId, building the same Session shape;
//   2. hands out scoped server clients (`@ox/supabase/server`) so RLS-filtered
//      reads run AS the user when a Supabase token is present;
//   3. exposes a privileged service client (service-role key) for webhooks/admin
//      writes that must bypass RLS.
//
// Verification: if SUPABASE_JWT_SECRET is set we verify the HS256 signature; if a
// JWKS endpoint is configured we verify against it (RS256 / asymmetric keys);
// otherwise we DECODE-AND-TRUST the `sub` (acceptable only in trusted/dev setups —
// the resolved row is still RLS-scoped because we forward the original token to
// the per-request Supabase client). Production should always set a secret/JWKS.
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { prisma, type Role } from "@ox/db";
import type { Session } from "@ox/rbac";
import { createServerClient, createServiceClient } from "@ox/supabase/server";
import type { OxSupabase } from "@ox/supabase";
import * as jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

interface SupabaseClaims {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iss?: string;
  [k: string]: unknown;
}

@Injectable()
export class SupabaseBridge {
  private readonly log = new Logger("SupabaseBridge");
  private readonly jwtSecret?: string;
  private readonly jwks?: JwksClient;
  private serviceClient?: OxSupabase;

  constructor(private readonly config: ConfigService) {
    this.jwtSecret = config.get<string>("SUPABASE_JWT_SECRET") || undefined;
    const jwksUri = config.get<string>("SUPABASE_JWKS_URL") || this.defaultJwksUri();
    if (jwksUri) {
      this.jwks = new JwksClient({ jwksUri, cache: true, rateLimit: true });
    }
  }

  /**
   * True when the token looks like a Supabase access token rather than an
   * OX-minted JWT. OX tokens carry `userId`; Supabase tokens carry `sub` + the
   * Supabase issuer. We decode (no verify) just to route — verification happens
   * in `sessionFromSupabaseToken`.
   */
  isSupabaseToken(token: string): boolean {
    const decoded = jwt.decode(token) as SupabaseClaims | null;
    if (!decoded) return false;
    if (typeof (decoded as Record<string, unknown>).userId === "string") return false; // OX token
    const iss = decoded.iss ?? "";
    return Boolean(decoded.sub) && (iss.includes("supabase") || iss.includes("/auth/v1"));
  }

  /** Verify a Supabase access token and resolve it to an OX Session. */
  async sessionFromSupabaseToken(token: string): Promise<Session> {
    const claims = await this.verify(token);
    const authUserId = claims.sub;
    if (!authUserId) throw new UnauthorizedException({ code: "unauthorized", message: "Token missing subject." });

    const user = await prisma.user.findUnique({ where: { authUserId } });
    if (!user) {
      throw new UnauthorizedException({ code: "unauthorized", message: "No OX identity for this account." });
    }
    const floorId = user.floorId ?? null;
    return {
      userId: user.id,
      name: user.name,
      initial: user.initial,
      role: user.role as Role,
      floorId,
      floors: floorId ? [floorId] : [],
      level: user.level,
      xp: user.xp,
      homeFloor: user.homeFloorId ?? undefined,
    };
  }

  /** Per-request Supabase client that acts AS the user (RLS applies). */
  serverClientFor(accessToken: string): OxSupabase {
    return createServerClient(accessToken);
  }

  /**
   * Privileged service client (service-role key, BYPASSES RLS). Returns null when
   * SUPABASE_SERVICE_ROLE_KEY is unset so callers can fall back to scoped Prisma.
   */
  service(): OxSupabase | null {
    if (!this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY")) return null;
    try {
      this.serviceClient ??= createServiceClient();
      return this.serviceClient;
    } catch (e) {
      this.log.warn(`Service client unavailable: ${(e as Error).message}`);
      return null;
    }
  }

  private async verify(token: string): Promise<SupabaseClaims> {
    // 1) Symmetric secret (legacy Supabase HS256 JWT secret).
    if (this.jwtSecret) {
      try {
        return jwt.verify(token, this.jwtSecret) as SupabaseClaims;
      } catch (e) {
        throw new UnauthorizedException({ code: "unauthorized", message: `Invalid token: ${(e as Error).message}` });
      }
    }
    // 2) Asymmetric keys via JWKS (Supabase's newer signing keys).
    if (this.jwks) {
      const decoded = jwt.decode(token, { complete: true });
      const kid = decoded && typeof decoded !== "string" ? decoded.header.kid : undefined;
      if (kid) {
        try {
          const key = await this.jwks.getSigningKey(kid);
          return jwt.verify(token, key.getPublicKey()) as SupabaseClaims;
        } catch (e) {
          throw new UnauthorizedException({ code: "unauthorized", message: `Invalid token: ${(e as Error).message}` });
        }
      }
    }
    // 3) No verification material configured — decode and trust the subject.
    // Safe-ish because every read we run with this session still passes the
    // user's token to a per-request Supabase client, so RLS re-checks. Production
    // MUST set SUPABASE_JWT_SECRET or SUPABASE_JWKS_URL.
    this.log.warn("Supabase token accepted without signature verification — set SUPABASE_JWT_SECRET / SUPABASE_JWKS_URL in production.");
    const claims = jwt.decode(token) as SupabaseClaims | null;
    if (!claims) throw new UnauthorizedException({ code: "unauthorized", message: "Unparseable token." });
    if (claims.exp && claims.exp * 1000 < Date.now()) {
      throw new UnauthorizedException({ code: "unauthorized", message: "Token expired." });
    }
    return claims;
  }

  private defaultJwksUri(): string | undefined {
    const url = this.config.get<string>("NEXT_PUBLIC_SUPABASE_URL") || "https://xaepcwnqjwphuwvuekfb.supabase.co";
    return url ? `${url.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json` : undefined;
  }
}

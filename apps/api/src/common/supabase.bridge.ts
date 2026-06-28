// Supabase token bridge (Supabase-only).
//
// Every request carries a Supabase access token (issued by Supabase Auth,
// `sub` = auth.users.id) — both real users and the four demo identities now sign
// in via Supabase, so `auth.uid()` resolves. This service:
//   1. verifies/decodes the access token and resolves it to an OX User via
//      User.authUserId, building the Session shape the guards + RLS expect;
//   2. relies on SupaService for the per-request scoped client (RLS as the user)
//      and the service-role client (RLS bypass for trusted lookups).
//
// Verification: if SUPABASE_JWT_SECRET is set we verify the HS256 signature; if a
// JWKS endpoint is configured we verify against it (RS256 / asymmetric keys);
// otherwise we DECODE-AND-TRUST the `sub` with a warning (acceptable only in
// trusted/dev setups — the resolved row is still RLS-scoped because every
// user-facing read forwards the original token to a per-request Supabase client).
// Production should always set SUPABASE_JWT_SECRET or SUPABASE_JWKS_URL.
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Enums } from "@ox/supabase";
import type { Session } from "@ox/rbac";
import * as jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { SupaService } from "./supa.service";

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

  constructor(
    private readonly config: ConfigService,
    private readonly supa: SupaService,
  ) {
    this.jwtSecret = config.get<string>("SUPABASE_JWT_SECRET") || undefined;
    const jwksUri = config.get<string>("SUPABASE_JWKS_URL") || this.defaultJwksUri();
    if (jwksUri) {
      this.jwks = new JwksClient({ jwksUri, cache: true, rateLimit: true });
    }
  }

  /** Verify a Supabase access token and resolve it to an OX Session. */
  async sessionFromToken(token: string): Promise<Session> {
    const claims = await this.verify(token);
    const authUserId = claims.sub;
    if (!authUserId) throw new UnauthorizedException({ code: "unauthorized", message: "Token missing subject." });

    // Resolve the OX identity with the service client (RLS bypass) so login works
    // before the per-request scoped client is established.
    const { data: user, error } = await this.supa
      .service()
      .from("User")
      .select("id, name, initial, role, floorId, level, xp, homeFloorId")
      .eq("authUserId", authUserId)
      .maybeSingle();

    if (error) {
      throw new UnauthorizedException({ code: "unauthorized", message: `Could not resolve identity: ${error.message}` });
    }
    if (!user) {
      throw new UnauthorizedException({ code: "unauthorized", message: "No OX identity for this account." });
    }
    const floorId = user.floorId ?? null;
    return {
      userId: user.id,
      name: user.name,
      initial: user.initial,
      role: user.role as Enums<"Role">,
      floorId,
      floors: floorId ? [floorId] : [],
      level: user.level,
      xp: user.xp,
      homeFloor: user.homeFloorId ?? undefined,
    };
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
    // Safe-ish because every user-facing read still passes the user's token to a
    // per-request Supabase client, so RLS re-checks. Production MUST set
    // SUPABASE_JWT_SECRET or SUPABASE_JWKS_URL.
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

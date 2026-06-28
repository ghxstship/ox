// Auth — demo OTP + JWT minting. Production swaps the identity map for a real
// OTP/passkey verifier; the Session shape + JWT claims stay identical.
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { prisma, type Role } from "@ox/db";
import type { Session } from "@ox/rbac";
import type { JwtClaims } from "../common/session";

/** The four demo identities the prototype signs in as (seed user ids). */
const DEMO_BY_EMAIL: Record<string, string> = {
  "mara@ox.fit": "u_mara",
  "dom@ox.fit": "u_dom",
  "iris@ox.fit": "u_iris",
  "hq@ox.fit": "u_hq",
};
const DEMO_IDS = new Set(["u_mara", "u_dom", "u_iris", "u_hq"]);
const DEMO_CODE = "000000";

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  /** Stub: "sends" a code, returns a challenge id we echo back on verify. */
  start(identity: string): { id: string } {
    // The id IS the identity for the demo — verify resolves it to a user.
    return { id: identity.trim() };
  }

  /** Verify a demo OTP and mint a JWT + Session. */
  async verify(id: string, code: string): Promise<{ jwt: string; session: Session }> {
    if (code !== DEMO_CODE) {
      // For the demo any matching identity also passes with code === id-derived,
      // but we keep it simple: only "000000" is accepted.
      throw new UnauthorizedException({ code: "unauthorized", message: "Invalid code." });
    }

    const userId = this.resolveUserId(id);
    const session = await this.sessionForUser(userId);
    const claims: JwtClaims = { userId: session.userId, role: session.role, floorId: session.floorId };
    const jwt = await this.jwt.signAsync(claims);
    return { jwt, session };
  }

  /** Map a demo id/email to a seed user id. */
  private resolveUserId(id: string): string {
    const key = id.trim().toLowerCase();
    if (DEMO_IDS.has(key)) return key;
    if (DEMO_BY_EMAIL[key]) return DEMO_BY_EMAIL[key];
    // Allow any seed user id straight through (resolved against DB on lookup).
    return id.trim();
  }

  /** Rebuild a Session from JWT claims (no DB hit needed for the hot path). */
  sessionFromClaims(claims: JwtClaims): Session {
    return {
      userId: claims.userId,
      name: claims.userId,
      initial: claims.userId.slice(0, 1).toUpperCase(),
      role: claims.role,
      floorId: claims.floorId ?? null,
      floors: claims.floorId ? [claims.floorId] : [],
    };
  }

  /** Build the full Session from the DB (used at sign-in). */
  async sessionForUser(userId: string): Promise<Session> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException({ code: "not_found", message: "Unknown identity." });

    // A host's scope floor is the floor they own; others use their floorId.
    const floorId = user.floorId ?? null;
    const floors = floorId ? [floorId] : [];
    return {
      userId: user.id,
      name: user.name,
      initial: user.initial,
      role: user.role as Role,
      floorId,
      floors,
      level: user.level,
      xp: user.xp,
      homeFloor: user.homeFloorId ?? undefined,
    };
  }
}

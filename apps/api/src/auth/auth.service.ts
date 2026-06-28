// Auth — OTP start/verify + JWT minting, and signout (server-side revocation).
//
// OTP flow:
//   start(identity)  → generate a 6-digit code, store it under a challenge id with
//                      a TTL, "send" it (log it; if a mailer is wired, email it).
//   verify(id, code) → check the code, find/create the User, mint { jwt, session }.
//
// The four demo identities (u_mara / u_dom / u_iris / u_hq, or their @ox.fit
// emails) keep working with the fixed code 000000 so the prototype signs straight
// in. Any other email/phone gets a freshly generated code (printed to the log).
//
// PRODUCTION: the in-memory challenge Map is per-instance and non-durable — swap
// it for Redis (shared, TTL'd) and plug a real mailer/SMS sender into `deliver`.
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { prisma, type Role } from "@ox/db";
import type { Session } from "@ox/rbac";
import { randomInt } from "node:crypto";
import type { JwtClaims } from "../common/session";
import { TokenDenylist } from "../common/token-denylist";

/** The four demo identities the prototype signs in as (seed user ids). */
const DEMO_BY_EMAIL: Record<string, string> = {
  "mara@ox.fit": "u_mara",
  "dom@ox.fit": "u_dom",
  "iris@ox.fit": "u_iris",
  "hq@ox.fit": "u_hq",
};
const DEMO_IDS = new Set(["u_mara", "u_dom", "u_iris", "u_hq"]);
const DEMO_CODE = "000000";
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface Challenge {
  identity: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class AuthService {
  private readonly log = new Logger("Auth");
  // challengeId → pending OTP. In prod this is Redis.
  private readonly challenges = new Map<string, Challenge>();

  constructor(
    private readonly jwt: JwtService,
    private readonly denylist: TokenDenylist,
    private readonly config: ConfigService,
  ) {}

  /** Begin an OTP challenge: generate + "send" a code, return its challenge id. */
  start(identity: string): { id: string } {
    const clean = identity.trim();
    if (!clean) throw new UnauthorizedException({ code: "unauthorized", message: "Email or phone required." });

    const id = `otp_${randomInt(0, 0xffffffff).toString(16)}_${Date.now().toString(36)}`;
    const isDemo = this.isDemoIdentity(clean);
    const code = isDemo ? DEMO_CODE : String(randomInt(0, 1_000_000)).padStart(6, "0");

    this.challenges.set(id, { identity: clean, code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
    this.sweep();
    this.deliver(clean, code, isDemo);
    return { id };
  }

  /** Verify a code against a challenge id and mint a session. */
  async verify(id: string, code: string): Promise<{ jwt: string; session: Session }> {
    const clean = code.trim();

    // Back-compat: the original demo accepted the IDENTITY itself as the challenge
    // id (e.g. { id: "u_mara", code: "000000" }). Honor that path so existing
    // clients keep working.
    if (!this.challenges.has(id) && this.isDemoIdentity(id) && clean === DEMO_CODE) {
      return this.mint(this.resolveUserId(id));
    }

    const challenge = this.challenges.get(id);
    if (!challenge) throw new UnauthorizedException({ code: "unauthorized", message: "Unknown or expired challenge." });
    if (challenge.expiresAt < Date.now()) {
      this.challenges.delete(id);
      throw new UnauthorizedException({ code: "unauthorized", message: "Code expired. Request a new one." });
    }
    if (challenge.attempts >= 5) {
      this.challenges.delete(id);
      throw new UnauthorizedException({ code: "unauthorized", message: "Too many attempts. Request a new code." });
    }
    challenge.attempts += 1;
    if (clean !== challenge.code) {
      throw new UnauthorizedException({ code: "unauthorized", message: "Invalid code." });
    }

    this.challenges.delete(id);
    const userId = this.resolveUserId(challenge.identity);
    return this.mint(userId);
  }

  /** Revoke a token server-side (signout). Denylisted until it would expire. */
  signout(token: string | undefined): void {
    if (!token) return;
    let exp: number | undefined;
    try {
      const decoded = this.jwt.decode(token) as { exp?: number } | null;
      exp = decoded?.exp;
    } catch {
      /* opaque/foreign token — deny with default TTL */
    }
    this.denylist.deny(token, exp);
  }

  /** Mint a JWT + Session for a resolved user id. */
  private async mint(userId: string): Promise<{ jwt: string; session: Session }> {
    const session = await this.sessionForUser(userId);
    const claims: JwtClaims = { userId: session.userId, role: session.role, floorId: session.floorId };
    const jwt = await this.jwt.signAsync(claims);
    return { jwt, session };
  }

  private isDemoIdentity(id: string): boolean {
    const key = id.trim().toLowerCase();
    return DEMO_IDS.has(key) || Boolean(DEMO_BY_EMAIL[key]);
  }

  /** Map a demo id/email to a seed user id; otherwise resolve by email in the DB. */
  private resolveUserId(id: string): string {
    const key = id.trim().toLowerCase();
    if (DEMO_IDS.has(key)) return key;
    if (DEMO_BY_EMAIL[key]) return DEMO_BY_EMAIL[key];
    return id.trim();
  }

  /** "Send" the code. Logs it always; emails it if a mailer endpoint is set. */
  private deliver(identity: string, code: string, isDemo: boolean): void {
    if (isDemo) {
      this.log.log(`OTP for demo identity ${identity}: use ${DEMO_CODE}.`);
      return;
    }
    const mailer = this.config.get<string>("OX_MAILER_FROM");
    if (mailer) {
      // A real mailer/SMS provider plugs in here. We log the dispatch intent so
      // the seam is observable without leaking the code at info level in prod.
      this.log.log(`OTP dispatched to ${identity} via ${mailer}.`);
      this.log.debug(`OTP for ${identity}: ${code}`);
    } else {
      this.log.warn(`No mailer configured — OTP for ${identity} is ${code} (console delivery).`);
    }
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

  /** Build the full Session from the DB (used at sign-in). Resolves by id or email. */
  async sessionForUser(idOrEmail: string): Promise<Session> {
    const isEmail = idOrEmail.includes("@");
    let user = await prisma.user.findUnique({
      where: isEmail ? { email: idOrEmail.toLowerCase() } : { id: idOrEmail },
    });
    // Fall back: a non-demo identity that has no row yet cannot sign in (we never
    // auto-provision arbitrary accounts in this scaffold). Demo ids always exist.
    if (!user && isEmail) {
      user = await prisma.user.findFirst({ where: { email: idOrEmail.toLowerCase() } });
    }
    if (!user) throw new NotFoundException({ code: "not_found", message: "Unknown identity." });

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

  private sweep(): void {
    const now = Date.now();
    for (const [k, v] of this.challenges) {
      if (v.expiresAt <= now) this.challenges.delete(k);
    }
  }
}

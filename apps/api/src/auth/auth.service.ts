// Auth — OTP demo start/verify + signout (server-side token revocation).
//
// The OX platform now authenticates entirely through Supabase Auth: the apps
// sign in with Supabase directly and send the resulting access token as the
// bearer. These OTP endpoints remain for the demo prototype: `start` issues a
// challenge id and "sends" a code, `verify` resolves the demo identity to its OX
// User row (via the Supabase service client) and returns the Session. They no
// longer mint a token — clients obtain their access token from Supabase.
//
// `signout` revokes the presented Supabase access token server-side (denylist).
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
import type { Enums } from "@ox/supabase";
import type { Session } from "@ox/rbac";
import { randomInt } from "node:crypto";
import { SupaService } from "../common/supa.service";
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
    private readonly denylist: TokenDenylist,
    private readonly config: ConfigService,
    private readonly supa: SupaService,
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

  /** Verify a code against a challenge id and return the resolved Session. */
  async verify(id: string, code: string): Promise<{ session: Session }> {
    const clean = code.trim();

    // Back-compat: the original demo accepted the IDENTITY itself as the challenge
    // id (e.g. { id: "u_mara", code: "000000" }). Honor that path.
    if (!this.challenges.has(id) && this.isDemoIdentity(id) && clean === DEMO_CODE) {
      return { session: await this.sessionForUser(this.resolveUserId(id)) };
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
    return { session: await this.sessionForUser(userId) };
  }

  /** Revoke a token server-side (signout). Denylisted until it would expire. */
  signout(token: string | undefined): void {
    if (!token) return;
    let exp: number | undefined;
    try {
      // Best-effort: decode the unix exp from the JWT's payload segment.
      const [, payload] = token.split(".");
      if (payload) {
        const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
        exp = decoded?.exp;
      }
    } catch {
      /* opaque/foreign token — deny with default TTL */
    }
    this.denylist.deny(token, exp);
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
      this.log.log(`OTP dispatched to ${identity} via ${mailer}.`);
      this.log.debug(`OTP for ${identity}: ${code}`);
    } else {
      this.log.warn(`No mailer configured — OTP for ${identity} is ${code} (console delivery).`);
    }
  }

  /** Build the full Session from the DB (used at sign-in). Resolves by id or email. */
  async sessionForUser(idOrEmail: string): Promise<Session> {
    const isEmail = idOrEmail.includes("@");
    const sb = this.supa.service();
    const { data: user, error } = await sb
      .from("User")
      .select("id, name, initial, role, floorId, level, xp, homeFloorId")
      .eq(isEmail ? "email" : "id", isEmail ? idOrEmail.toLowerCase() : idOrEmail)
      .maybeSingle();

    if (error) throw new NotFoundException({ code: "not_found", message: `Lookup failed: ${error.message}` });
    if (!user) throw new NotFoundException({ code: "not_found", message: "Unknown identity." });

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

  private sweep(): void {
    const now = Date.now();
    for (const [k, v] of this.challenges) {
      if (v.expiresAt <= now) this.challenges.delete(k);
    }
  }
}

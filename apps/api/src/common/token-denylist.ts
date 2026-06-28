// Server-side token denylist for signout.
//
// JWTs are stateless, so "signing out" means refusing a still-valid token after
// the user asked us to. We hold the revoked jti/token-hash in memory with a TTL
// equal to the token's remaining lifetime, then evict.
//
// PRODUCTION: swap this in-memory Set for Redis (or any shared store) so the
// denylist survives restarts and is shared across API instances. The interface
// here (deny / isDenied) stays identical.
import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "node:crypto";

interface DeniedEntry {
  expiresAt: number; // epoch ms
}

@Injectable()
export class TokenDenylist {
  private readonly log = new Logger("TokenDenylist");
  private readonly denied = new Map<string, DeniedEntry>();

  /** Revoke a token until `exp` (unix seconds). Falls back to a short TTL. */
  deny(token: string, exp?: number): void {
    const expiresAt = exp ? exp * 1000 : Date.now() + 30 * 86_400_000;
    this.denied.set(this.key(token), { expiresAt });
    this.sweep();
  }

  isDenied(token: string): boolean {
    const entry = this.denied.get(this.key(token));
    if (!entry) return false;
    if (entry.expiresAt <= Date.now()) {
      this.denied.delete(this.key(token));
      return false;
    }
    return true;
  }

  private key(token: string): string {
    // Store a hash, never the raw token.
    return createHash("sha256").update(token).digest("hex");
  }

  private sweep(): void {
    const now = Date.now();
    for (const [k, v] of this.denied) {
      if (v.expiresAt <= now) this.denied.delete(k);
    }
  }
}

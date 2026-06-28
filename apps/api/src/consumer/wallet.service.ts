// Wallet / Credits (consumer parity). A member's credit balance is the running
// sum of a CreditLedger — every debit/credit appends a row carrying the
// balanceAfter, so the balance is auditable and never drifts. Member-owned:
// scoped by userId via ScopeRunner (RLS) + explicit userId filters.
import { ForbiddenException, Injectable } from "@nestjs/common";
import { type Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";

export type CreditReason = "purchase" | "booking" | "refund" | "gift" | "adjustment" | "referral";

@Injectable()
export class WalletService {
  constructor(private readonly scope: ScopeRunner) {}

  /** Ledger (newest first) plus the computed current balance. */
  ledger(session: Session) {
    return this.scope.run(session, async (tx) => {
      const entries = await tx.creditLedger.findMany({
        where: { userId: session.userId },
        orderBy: { at: "desc" },
      });
      const balance = entries[0]?.balanceAfter ?? 0;
      return { balance, entries };
    });
  }

  /**
   * Append a ledger row inside an existing transaction (used by checkout / packs
   * / booking). `delta` is signed: positive credits, negative debits. Throws when
   * a debit would overdraw the balance.
   */
  async post(
    tx: Prisma.TransactionClient,
    userId: string,
    delta: number,
    reason: CreditReason,
    note?: string,
  ) {
    const last = await tx.creditLedger.findFirst({ where: { userId }, orderBy: { at: "desc" } });
    const balanceAfter = (last?.balanceAfter ?? 0) + delta;
    if (balanceAfter < 0) {
      throw new ForbiddenException({ code: "bad_request", message: "Not enough credits in the wallet." });
    }
    return tx.creditLedger.create({ data: { userId, delta, balanceAfter, reason, note } });
  }
}

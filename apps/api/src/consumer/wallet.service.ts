// Wallet / Credits (consumer parity). A member's credit balance is the running
// sum of a CreditLedger — every debit/credit appends a row carrying the
// balanceAfter, so the balance is auditable and never drifts. Member-owned:
// scoped by userId via Supabase (RLS) + explicit userId filters.
import { ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import type { OxSupabase } from "@ox/supabase";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";

export type CreditReason = "purchase" | "booking" | "refund" | "gift" | "adjustment" | "referral";

@Injectable()
export class WalletService {
  constructor(private readonly supa: SupaService) {}

  /** Ledger (newest first) plus the computed current balance. */
  async ledger(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("CreditLedger")
      .select("*")
      .eq("userId", session.userId)
      .order("at", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    const entries = data ?? [];
    const balance = entries[0]?.balanceAfter ?? 0;
    return { balance, entries };
  }

  /**
   * Append a ledger row using the given Supabase client (used by checkout / packs
   * / booking). `delta` is signed: positive credits, negative debits. Throws when
   * a debit would overdraw the balance.
   */
  async post(
    sb: OxSupabase,
    userId: string,
    delta: number,
    reason: CreditReason,
    note?: string,
  ) {
    const { data: last, error: readErr } = await sb
      .from("CreditLedger")
      .select("balanceAfter")
      .eq("userId", userId)
      .order("at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (readErr) throw new InternalServerErrorException({ code: "internal", message: readErr.message });
    const balanceAfter = (last?.balanceAfter ?? 0) + delta;
    if (balanceAfter < 0) {
      throw new ForbiddenException({ code: "bad_request", message: "Not enough credits in the wallet." });
    }
    const { data, error } = await sb
      .from("CreditLedger")
      .insert({ userId, delta, balanceAfter, reason, note })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }
}

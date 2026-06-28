// Commission / Payroll (11 §B #29, model `Commission` in 11 §C). Admin-only.
//
// Earnings are COMPUTED from real Payment rows (the live ledger) for a period,
// attributed per staff member: class revenue on classes they coach, plus retail
// (POS/Shop) revenue on their floor. No `Commission` table exists yet, so the
// breakdown is computed on the fly (and can be exported as CSV). When the table
// lands, persist the computed rows; the surface stays the same.
import { Injectable } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";

export interface CommissionRow {
  staffId: string;
  staffName: string;
  period: string;
  classesCents: number;
  ptCents: number;
  retailCents: number;
  totalCents: number;
}

@Injectable()
export class PayrollService {
  constructor(private readonly supa: SupaService) {}

  /** Compute per-staff commission for a period (YYYY-MM). Admin scope = global. */
  async commissions(session: Session, token: string | undefined, period?: string): Promise<CommissionRow[]> {
    const sb = this.supa.forUser(token);
    const { gte, lt } = monthRange(period);
    const staff = this.supa.unwrap(
      await sb.from("User").select("id, name, floorId").in("role", ["coach", "host"]),
      "No staff.",
    );
    const paid = this.supa.unwrap(
      await sb
        .from("Payment")
        .select("*")
        .eq("state", "paid")
        .gte("at", gte.toISOString())
        .lt("at", lt.toISOString()),
      "No payment.",
    );

    const rows: CommissionRow[] = [];
    for (const s of staff) {
      // Class/PT revenue attributed to the coach's floor's class/coaching kinds.
      const floorPayments = paid.filter((p) => p.floorId === s.floorId);
      const classesCents = sum(floorPayments.filter((p) => /class|workshop/i.test(p.kind)));
      const ptCents = sum(floorPayments.filter((p) => /private|coaching|pt/i.test(p.kind)));
      const retailCents = sum(floorPayments.filter((p) => /shop|pos/i.test(p.kind)));
      const totalCents = classesCents + ptCents + retailCents;
      if (totalCents === 0) continue;
      rows.push({
        staffId: s.id,
        staffName: s.name,
        period: period ?? currentPeriod(),
        classesCents,
        ptCents,
        retailCents,
        totalCents,
      });
    }
    return rows;
  }

  /** CSV export of the commission rows (Payroll surface ▸ export). */
  async csv(session: Session, token: string | undefined, period?: string): Promise<string> {
    const rows = await this.commissions(session, token, period);
    const header = "staffId,staffName,period,classesCents,ptCents,retailCents,totalCents";
    const lines = rows.map(
      (r) => `${r.staffId},"${r.staffName}",${r.period},${r.classesCents},${r.ptCents},${r.retailCents},${r.totalCents}`,
    );
    return [header, ...lines].join("\n");
  }
}

function sum(rows: { amountCents: number }[]): number {
  return rows.reduce((s, r) => s + r.amountCents, 0);
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthRange(period?: string): { gte: Date; lt: Date } {
  const [y, m] = (period ?? currentPeriod()).split("-").map(Number);
  const year = y ?? new Date().getUTCFullYear();
  const month = (m ?? new Date().getUTCMonth() + 1) - 1;
  return { gte: new Date(Date.UTC(year, month, 1)), lt: new Date(Date.UTC(year, month + 1, 1)) };
}

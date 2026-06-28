// Commission / Payroll (11 §B #29, model `Commission` in 11 §C). Admin-only.
//
// Earnings are COMPUTED from real Payment rows (the live ledger) for a period,
// attributed per staff member: class revenue on classes they coach, plus retail
// (POS/Shop) revenue on their floor. No `Commission` table exists yet, so the
// breakdown is computed on the fly (and can be exported as CSV). When the table
// lands, persist the computed rows; the surface stays the same.
import { Injectable } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";

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
  constructor(private readonly scope: ScopeRunner) {}

  /** Compute per-staff commission for a period (YYYY-MM). Admin scope = global. */
  commissions(session: Session, period?: string): Promise<CommissionRow[]> {
    return this.scope.run(session, async (tx) => {
      const { gte, lt } = monthRange(period);
      const staff = await tx.user.findMany({
        where: { role: { in: ["coach", "host"] } },
        select: { id: true, name: true, floorId: true },
      });
      const paid = await tx.payment.findMany({ where: { state: "paid", at: { gte, lt } } });

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
    });
  }

  /** CSV export of the commission rows (Payroll surface ▸ export). */
  async csv(session: Session, period?: string): Promise<string> {
    const rows = await this.commissions(session, period);
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

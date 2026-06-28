// Operator / CRM / billing. Every list is RLS-scoped (host=floor, coach=roster,
// admin=all) — we never hand-filter; supa.forUser(token) runs AS the caller and
// the policies return only the visible rows.
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import type { Enums } from "@ox/supabase";
import type { Session } from "@ox/rbac";
import { BillingService } from "../billing/billing.service";
import { SupaService } from "../common/supa.service";

@Injectable()
export class OpsService {
  constructor(
    private readonly supa: SupaService,
    private readonly billing: BillingService,
  ) {}

  /** Members — RLS scopes the set (self / roster / floor / all). */
  async members(session: Session, token: string | undefined) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("User")
      .select("id, name, initial, level, xp, floorId, coachId")
      .eq("role", "member")
      .order("name", { ascending: true });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async member(session: Session, token: string | undefined, id: string) {
    const sb = this.supa.forUser(token);
    const { data: user } = await sb.from("User").select("*").eq("id", id).maybeSingle();
    if (!user) throw new NotFoundException({ code: "not_found", message: "No member (or out of scope)." });
    const [{ data: memberships }, { data: bookings }, { data: payments }] = await Promise.all([
      sb.from("Membership").select("*").eq("userId", id),
      sb.from("Booking").select("*").eq("userId", id),
      sb.from("Payment").select("*").eq("userId", id),
    ]);
    const bookingsWithClass = await Promise.all(
      (bookings ?? []).map(async (b) => {
        const { data: klass } = await sb.from("Class").select("*").eq("id", b.classId).maybeSingle();
        return { ...b, class: klass };
      }),
    );
    return { ...user, memberships: memberships ?? [], bookings: bookingsWithClass, payments: payments ?? [] };
  }

  /** Coach roster — members coached by the caller (RLS enforces coachId == me). */
  async clients(session: Session, token: string | undefined) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("User")
      .select("id, name, initial, level, xp, floorId, coachId")
      .eq("role", "member")
      .order("name", { ascending: true });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async payments(session: Session, token: string | undefined) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("Payment")
      .select("*")
      .order("at", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  /**
   * Retry a failed payment via Stripe (Payment state machine: failed → pending).
   * Live mode reuses the original PaymentIntent if it is still retriable, else
   * mints a fresh one; mock mode mints a fake intent. Returns the fresh client
   * secret so the operator UI can collect a new payment method.
   */
  async retryPayment(session: Session, token: string | undefined, id: string) {
    const sb = this.supa.forUser(token);
    const { data: pay } = await sb.from("Payment").select("*").eq("id", id).maybeSingle();
    if (!pay) throw new NotFoundException({ code: "not_found", message: "No payment (or out of scope)." });
    const pi = await this.billing.retry(pay.amountCents, pay.kind, pay.stripePiId ?? undefined);
    const { data: updated, error } = await sb
      .from("Payment")
      .update({ state: "pending", stripePiId: pi.id })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return { payment: updated, clientSecret: pi.clientSecret, mock: pi.mock };
  }

  async memberships(session: Session, token: string | undefined) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("Membership")
      .select("*")
      .order("createdAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  /**
   * Subscribe a member to a tier (Membership state machine: (none) → active).
   * Ensures a Stripe Customer, creates a Subscription (priceId from the tier
   * mapping / env), and writes the Membership row. Mock mode returns a fake sub.
   */
  async subscribe(
    session: Session,
    token: string | undefined,
    input: { userId: string; floorId: string; tier: string; priceId?: string; addOns?: string[] },
  ) {
    const sb = this.supa.forUser(token);
    const { data: user } = await sb.from("User").select("id, email, name").eq("id", input.userId).maybeSingle();
    if (!user) throw new NotFoundException({ code: "not_found", message: "No member (or out of scope)." });

    const customer = await this.billing.ensureCustomer(user.id, user.email, user.name);
    const priceId = input.priceId ?? `price_${input.tier}`; // tier→price map in prod config
    const sub = await this.billing.createSubscription(customer.id, priceId, { userId: user.id, tier: input.tier });

    const { data: membership, error } = await sb
      .from("Membership")
      .insert({
        userId: input.userId,
        floorId: input.floorId,
        tier: input.tier as Enums<"Tier">,
        addOns: input.addOns ?? [],
        status: (sub.status === "active" ? "active" : "past_due") as Enums<"MembershipStatus">,
        renewsAt: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
        stripeSubId: sub.id,
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return { membership, clientSecret: sub.latestInvoicePaymentIntentClientSecret, mock: sub.mock };
  }

  /**
   * Update a membership lifecycle: pause | resume | cancel (cancel at period
   * end → access ends later). Mirrors the Membership state machine in 05.
   */
  async updateMembership(session: Session, token: string | undefined, id: string, action: "pause" | "resume" | "cancel") {
    const sb = this.supa.forUser(token);
    const { data: membership } = await sb.from("Membership").select("*").eq("id", id).maybeSingle();
    if (!membership) throw new NotFoundException({ code: "not_found", message: "No membership (or out of scope)." });

    let status: Enums<"MembershipStatus"> = membership.status;
    if (membership.stripeSubId) {
      if (action === "pause") await this.billing.pauseSubscription(membership.stripeSubId, true);
      if (action === "resume") await this.billing.pauseSubscription(membership.stripeSubId, false);
      if (action === "cancel") await this.billing.cancelSubscription(membership.stripeSubId, true);
    }
    if (action === "pause") status = "paused";
    if (action === "resume") status = "active";
    if (action === "cancel") status = "cancelled";

    const { data, error } = await sb.from("Membership").update({ status }).eq("id", id).select().single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  /** Named reports — aggregate over the RLS-visible rows only. */
  async report(session: Session, token: string | undefined, name: string) {
    const sb = this.supa.forUser(token);
    switch (name) {
      case "revenue": {
        const { data: paid } = await sb.from("Payment").select("amountCents").eq("state", "paid");
        const totalCents = (paid ?? []).reduce((s, p) => s + p.amountCents, 0);
        return { name, totalCents, count: paid?.length ?? 0 };
      }
      case "utilization": {
        const { count: classes } = await sb.from("Class").select("*", { count: "exact", head: true });
        const { count: bookings } = await sb
          .from("Booking")
          .select("*", { count: "exact", head: true })
          .in("state", ["booked", "attended"]);
        return { name, classes: classes ?? 0, bookings: bookings ?? 0 };
      }
      case "retention": {
        const { count: active } = await sb
          .from("Membership")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");
        const { count: total } = await sb.from("Membership").select("*", { count: "exact", head: true });
        const totalCount = total ?? 0;
        const activeCount = active ?? 0;
        return { name, active: activeCount, total: totalCount, rate: totalCount ? activeCount / totalCount : 0 };
      }
      case "demographics": {
        const { data: rows } = await sb.from("Membership").select("tier");
        const counts = new Map<string, number>();
        for (const r of rows ?? []) counts.set(r.tier, (counts.get(r.tier) ?? 0) + 1);
        const byTier = [...counts.entries()].map(([tier, count]) => ({ tier, _count: { _all: count } }));
        return { name, byTier };
      }
      default:
        throw new NotFoundException({ code: "not_found", message: `Unknown report: ${name}.` });
    }
  }
}

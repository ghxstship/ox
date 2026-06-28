// Admin-only console. Every route requires the "*" capability (admin). With "*"
// granted, RLS returns the global set, so these are unfiltered platform views.
import { Controller, Get, InternalServerErrorException } from "@nestjs/common";
import { Capability, CurrentSession, CurrentToken } from "../common/decorators";
import type { Session } from "../common/session";
import { SupaService } from "../common/supa.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly supa: SupaService) {}

  @Get("floors")
  @Capability("*")
  async floors(@CurrentSession() _session: Session, @CurrentToken() token?: string) {
    const sb = this.supa.forUser(token);
    const { data: floors, error } = await sb.from("Floor").select("*");
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return Promise.all(
      (floors ?? []).map(async (floor) => {
        const [{ data: equipment }, { count: classes }, { count: members }] = await Promise.all([
          sb.from("FloorEquipment").select("*").eq("floorId", floor.id),
          sb.from("Class").select("*", { count: "exact", head: true }).eq("floorId", floor.id),
          sb.from("User").select("*", { count: "exact", head: true }).eq("floorId", floor.id),
        ]);
        return { ...floor, equipment: equipment ?? [], _count: { classes: classes ?? 0, members: members ?? 0 } };
      }),
    );
  }

  @Get("challenges")
  @Capability("*")
  async challenges(@CurrentSession() _session: Session, @CurrentToken() token?: string) {
    const sb = this.supa.forUser(token);
    const { data: challenges, error } = await sb.from("Challenge").select("*").order("startsAt", { ascending: true });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return Promise.all(
      (challenges ?? []).map(async (challenge) => {
        const { count } = await sb
          .from("ChallengeEntry")
          .select("*", { count: "exact", head: true })
          .eq("challengeId", challenge.id);
        return { ...challenge, _count: { entries: count ?? 0 } };
      }),
    );
  }

  @Get("staff")
  @Capability("*")
  async staff(@CurrentSession() _session: Session, @CurrentToken() token?: string) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("User")
      .select("id, name, initial, role, floorId")
      .in("role", ["coach", "host", "admin"])
      .order("role", { ascending: true });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  @Get("analytics")
  @Capability("*")
  async analytics(@CurrentSession() _session: Session, @CurrentToken() token?: string) {
    const sb = this.supa.forUser(token);
    const [floorsRes, membersRes, classesRes, paidRes, openRes] = await Promise.all([
      sb.from("Floor").select("*", { count: "exact", head: true }),
      sb.from("User").select("*", { count: "exact", head: true }).eq("role", "member"),
      sb.from("Class").select("*", { count: "exact", head: true }),
      sb.from("Payment").select("amountCents").eq("state", "paid"),
      sb.from("Membership").select("*", { count: "exact", head: true }).eq("status", "active"),
    ]);
    const revenueCents = (paidRes.data ?? []).reduce((s, p) => s + p.amountCents, 0);
    return {
      floors: floorsRes.count ?? 0,
      members: membersRes.count ?? 0,
      classes: classesRes.count ?? 0,
      revenueCents,
      activeMemberships: openRes.count ?? 0,
    };
  }
}

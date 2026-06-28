// /me — the authenticated member. All reads run through RLS scope (self-only).
import { Controller, Get, NotFoundException } from "@nestjs/common";
import { Capability, CurrentSession, CurrentToken } from "../common/decorators";
import type { Session } from "../common/session";
import { SupaService } from "../common/supa.service";

@Controller("me")
export class MeController {
  constructor(private readonly supa: SupaService) {}

  @Get()
  @Capability("self.view")
  async me(@CurrentSession() session: Session, @CurrentToken() token?: string) {
    const { data: user, error } = await this.supa
      .forUser(token)
      .from("User")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle();
    if (error) throw new NotFoundException({ code: "not_found", message: error.message });
    if (!user) throw new NotFoundException({ code: "not_found", message: "No member." });
    return {
      id: user.id,
      handle: "@" + user.name.split(" ")[0]?.toLowerCase(),
      name: user.name,
      initial: user.initial,
      tier: "compass",
      memberNumber: String(user.level).padStart(3, "0"),
      role: user.role,
      session,
    };
  }

  @Get("progress")
  @Capability("self.view")
  async progress(@CurrentSession() session: Session, @CurrentToken() token?: string) {
    const { data: user } = await this.supa
      .forUser(token)
      .from("User")
      .select("level, xp")
      .eq("id", session.userId)
      .maybeSingle();
    const level = user?.level ?? 1;
    const xp = user?.xp ?? 0;
    const xpMax = level * 200;
    return {
      level,
      rank: rankFor(level),
      xp,
      xpMax,
      xpToNext: Math.max(0, xpMax - (xp % xpMax || xp)),
      streakDays: 0,
      streakActive: false,
    };
  }

  @Get("recovery")
  @Capability("self.view")
  async recovery(@CurrentSession() session: Session, @CurrentToken() token?: string) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("Recovery")
      .select("*")
      .eq("userId", session.userId);
    if (error) throw new NotFoundException({ code: "not_found", message: error.message });
    return data;
  }

  @Get("prs")
  @Capability("self.view")
  async prs(@CurrentSession() session: Session, @CurrentToken() token?: string) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("PR")
      .select("*")
      .eq("userId", session.userId)
      .order("at", { ascending: false });
    if (error) throw new NotFoundException({ code: "not_found", message: error.message });
    return data;
  }

  @Get("orders")
  @Capability("self.view")
  async orders(@CurrentSession() session: Session, @CurrentToken() token?: string) {
    const sb = this.supa.forUser(token);
    const { data: orders, error } = await sb
      .from("Order")
      .select("*")
      .eq("userId", session.userId)
      .order("createdAt", { ascending: false });
    if (error) throw new NotFoundException({ code: "not_found", message: error.message });
    const withItems = await Promise.all(
      (orders ?? []).map(async (order) => {
        const { data: items } = await sb.from("OrderItem").select("*").eq("orderId", order.id);
        return { ...order, items: items ?? [] };
      }),
    );
    return withItems;
  }

  @Get("credential")
  @Capability("self.view")
  async credential(@CurrentSession() session: Session, @CurrentToken() token?: string) {
    const { data: user, error } = await this.supa
      .forUser(token)
      .from("User")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle();
    if (error) throw new NotFoundException({ code: "not_found", message: error.message });
    if (!user) throw new NotFoundException({ code: "not_found", message: "No member." });
    return {
      material: "digital",
      memberNumber: String(user.level).padStart(3, "0"),
      fields: [
        { label: "Name", value: user.name },
        { label: "Level", value: String(user.level) },
        { label: "Home floor", value: user.homeFloorId ?? "—" },
      ],
      strip: user.role.toUpperCase(),
      verified: true,
    };
  }
}

function rankFor(level: number): string {
  if (level >= 12) return "Pathfinder";
  if (level >= 8) return "Tracker";
  if (level >= 4) return "Scout";
  return "Newcomer";
}

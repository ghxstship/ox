// /me — the authenticated member. All reads run through RLS scope (self-only).
import { Controller, Get, NotFoundException } from "@nestjs/common";
import { prisma } from "@ox/db";
import { Capability, CurrentSession } from "../common/decorators";
import { ScopeRunner } from "../common/scope.runner";
import type { Session } from "../common/session";

@Controller("me")
export class MeController {
  constructor(private readonly scope: ScopeRunner) {}

  @Get()
  @Capability("self.view")
  async me(@CurrentSession() session: Session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
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
  async progress(@CurrentSession() session: Session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
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
  recovery(@CurrentSession() session: Session) {
    return this.scope.run(session, (tx) => tx.recovery.findMany({ where: { userId: session.userId } }));
  }

  @Get("prs")
  @Capability("self.view")
  prs(@CurrentSession() session: Session) {
    return this.scope.run(session, (tx) =>
      tx.pR.findMany({ where: { userId: session.userId }, orderBy: { at: "desc" } }),
    );
  }

  @Get("orders")
  @Capability("self.view")
  orders(@CurrentSession() session: Session) {
    return this.scope.run(session, (tx) =>
      tx.order.findMany({
        where: { userId: session.userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
    );
  }

  @Get("credential")
  @Capability("self.view")
  async credential(@CurrentSession() session: Session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
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

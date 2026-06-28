// Staff Scheduling / Shifts (11 §B #28, model `Shift` in 11 §C).
//
// Now persisted to the live DB; reads run as the caller so RLS applies. We also
// scope explicitly: host sees their floor; coach sees their own shifts; admin
// sees all. Cover requests flip a flag the schedule grid surfaces.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";

export type ShiftKind = "class" | "floor" | "open";

@Injectable()
export class StaffService {
  constructor(private readonly supa: SupaService) {}

  async list(session: Session, token: string | undefined) {
    let q = this.supa.forUser(token).from("Shift").select("*").order("startsAt", { ascending: true });
    if (session.role === "host") q = q.eq("floorId", session.floorId ?? "__none__");
    else if (session.role === "coach") q = q.eq("staffId", session.userId);
    else if (session.role !== "admin") q = q.eq("id", "__none__");
    return this.supa.unwrap(await q, "No shift.");
  }

  create(session: Session, token: string | undefined, input: { staffId?: string; startsAt: string; endsAt: string; kind?: ShiftKind; floorId?: string }) {
    const floorId =
      session.role === "admin" ? input.floorId ?? session.floorId ?? "" : session.floorId ?? "";
    if (!floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return this.supa
      .forUser(token)
      .from("Shift")
      .insert({
        floorId,
        staffId: input.staffId ?? session.userId,
        startsAt: new Date(input.startsAt).toISOString(),
        endsAt: new Date(input.endsAt).toISOString(),
        kind: input.kind ?? "floor",
        coverRequested: false,
      })
      .select()
      .single()
      .then((res) => this.supa.unwrap(res, "No shift."));
  }

  async requestCover(session: Session, token: string | undefined, id: string) {
    const sb = this.supa.forUser(token);
    let q = sb.from("Shift").select("*").eq("id", id);
    if (session.role === "host") q = q.eq("floorId", session.floorId ?? "__none__");
    else if (session.role === "coach") q = q.eq("staffId", session.userId);
    else if (session.role !== "admin") q = q.eq("id", "__none__");
    const shift = this.supa.unwrapMaybe(await q.maybeSingle());
    if (!shift) throw new NotFoundException({ code: "not_found", message: "No shift." });
    return this.supa.unwrap(
      await sb.from("Shift").update({ coverRequested: true }).eq("id", id).select().single(),
      "No shift.",
    );
  }
}

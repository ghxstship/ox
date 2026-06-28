// Contracts / Waivers + e-sign (11 §B #31, models `Agreement`/`Signature`).
//
// Agreements are floor-scoped templates; members sign them (a Signature row with
// the data-url of their drawn signature + timestamp). Now persisted to the live
// DB; reads run as the caller so RLS applies; the signed archive is queryable. We
// also scope explicitly (host=floor, member=own) to keep tenants apart.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";

@Injectable()
export class ContractsService {
  constructor(private readonly supa: SupaService) {}

  async list(session: Session, token: string | undefined) {
    let q = this.supa
      .forUser(token)
      .from("Agreement")
      .select("*")
      .eq("archived", false)
      .order("createdAt", { ascending: false });
    if (session.role !== "admin") q = q.eq("floorId", session.floorId ?? "__none__");
    return this.supa.unwrap(await q, "No agreement.");
  }

  create(session: Session, token: string | undefined, input: { title: string; body: string; floorId?: string }) {
    const floorId =
      session.role === "admin" ? input.floorId ?? session.floorId ?? "" : session.floorId ?? "";
    if (!floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return this.supa
      .forUser(token)
      .from("Agreement")
      .insert({ floorId, title: input.title, body: input.body, version: 1 })
      .select()
      .single()
      .then((res) => this.supa.unwrap(res, "No agreement."));
  }

  /** Sign an agreement. Any signed-in user may sign one visible on their floor. */
  async sign(session: Session, token: string | undefined, agreementId: string, dataUrl: string) {
    if (!dataUrl?.startsWith("data:")) {
      throw new ForbiddenException({ code: "bad_request", message: "A signature image is required." });
    }
    const sb = this.supa.forUser(token);
    const agreement = this.supa.unwrapMaybe(await sb.from("Agreement").select("*").eq("id", agreementId).maybeSingle());
    if (!agreement) throw new NotFoundException({ code: "not_found", message: "No agreement." });
    return this.supa.unwrap(
      await sb
        .from("Signature")
        .insert({ agreementId, floorId: agreement.floorId, userId: session.userId, dataUrl })
        .select()
        .single(),
      "No agreement.",
    );
  }

  /** Signed archive — operators see their floor's signatures; users see their own. */
  async archive(session: Session, token: string | undefined, agreementId?: string) {
    let q = this.supa.forUser(token).from("Signature").select("*").order("signedAt", { ascending: false });
    if (agreementId) q = q.eq("agreementId", agreementId);
    if (session.role === "host") q = q.eq("floorId", session.floorId ?? "__none__");
    else if (session.role !== "admin") q = q.eq("userId", session.userId);
    return this.supa.unwrap(await q, "No agreement.");
  }
}

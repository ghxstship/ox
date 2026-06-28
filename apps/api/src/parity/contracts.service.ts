// Contracts / Waivers + e-sign (11 §B #31, models `Agreement`/`Signature`).
//
// Agreements are floor-scoped templates; members sign them (a Signature row with
// the data-url of their drawn signature + timestamp). Now persisted to the live
// DB via ScopeRunner so RLS applies; the signed archive is queryable. We also
// scope explicitly (host=floor, member=own) to keep tenants apart.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { type Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";

@Injectable()
export class ContractsService {
  constructor(private readonly scope: ScopeRunner) {}

  private agreementWhere(session: Session): Prisma.AgreementWhereInput {
    return session.role === "admin" ? {} : { floorId: session.floorId ?? "__none__" };
  }

  list(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.agreement.findMany({ where: { ...this.agreementWhere(session), archived: false }, orderBy: { createdAt: "desc" } }),
    );
  }

  create(session: Session, input: { title: string; body: string; floorId?: string }) {
    const floorId =
      session.role === "admin" ? input.floorId ?? session.floorId ?? "" : session.floorId ?? "";
    if (!floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return this.scope.run(session, (tx) =>
      tx.agreement.create({ data: { floorId, title: input.title, body: input.body, version: 1 } }),
    );
  }

  /** Sign an agreement. Any signed-in user may sign one visible on their floor. */
  sign(session: Session, agreementId: string, dataUrl: string) {
    if (!dataUrl?.startsWith("data:")) {
      throw new ForbiddenException({ code: "bad_request", message: "A signature image is required." });
    }
    return this.scope.run(session, async (tx) => {
      const agreement = await tx.agreement.findUnique({ where: { id: agreementId } });
      if (!agreement) throw new NotFoundException({ code: "not_found", message: "No agreement." });
      return tx.signature.create({
        data: { agreementId, floorId: agreement.floorId, userId: session.userId, dataUrl },
      });
    });
  }

  /** Signed archive — operators see their floor's signatures; users see their own. */
  archive(session: Session, agreementId?: string) {
    return this.scope.run(session, (tx) => {
      const where: Prisma.SignatureWhereInput = {};
      if (agreementId) where.agreementId = agreementId;
      if (session.role === "host") where.floorId = session.floorId ?? "__none__";
      else if (session.role !== "admin") where.userId = session.userId;
      return tx.signature.findMany({ where, orderBy: { signedAt: "desc" } });
    });
  }
}

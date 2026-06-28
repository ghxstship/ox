// Contracts / Waivers + e-sign (11 §B #31, models `Agreement`/`Signature`).
//
// Agreements are floor-scoped templates; members sign them (a Signature row with
// the data-url of their drawn signature + timestamp). No tables in the live DB
// yet, so both live in memory, floor-scoped. The signed archive is queryable.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { randomUUID } from "node:crypto";

export interface Agreement {
  id: string;
  floorId: string;
  title: string;
  body: string;
  version: number;
  createdAt: string;
}

export interface Signature {
  id: string;
  agreementId: string;
  userId: string;
  dataUrl: string;
  signedAt: string;
}

@Injectable()
export class ContractsService {
  private readonly agreements = new Map<string, Agreement>();
  private readonly signatures = new Map<string, Signature>();

  private visible(session: Session, a: Agreement): boolean {
    if (session.role === "admin") return true;
    return Boolean(session.floorId) && a.floorId === session.floorId;
  }

  list(session: Session): Agreement[] {
    return [...this.agreements.values()].filter((a) => this.visible(session, a));
  }

  create(session: Session, input: { title: string; body: string; floorId?: string }): Agreement {
    const floorId =
      session.role === "admin" ? input.floorId ?? session.floorId ?? "" : session.floorId ?? "";
    if (!floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    const agreement: Agreement = {
      id: `agr_${randomUUID()}`,
      floorId,
      title: input.title,
      body: input.body,
      version: 1,
      createdAt: new Date().toISOString(),
    };
    this.agreements.set(agreement.id, agreement);
    return agreement;
  }

  /** Sign an agreement. Any signed-in user may sign one visible on their floor. */
  sign(session: Session, agreementId: string, dataUrl: string): Signature {
    const agreement = this.agreements.get(agreementId);
    if (!agreement) throw new NotFoundException({ code: "not_found", message: "No agreement." });
    if (!dataUrl?.startsWith("data:")) {
      throw new ForbiddenException({ code: "bad_request", message: "A signature image is required." });
    }
    const sig: Signature = {
      id: `sig_${randomUUID()}`,
      agreementId,
      userId: session.userId,
      dataUrl,
      signedAt: new Date().toISOString(),
    };
    this.signatures.set(sig.id, sig);
    return sig;
  }

  /** Signed archive — operators see their floor's signatures; users see their own. */
  archive(session: Session, agreementId?: string): Signature[] {
    return [...this.signatures.values()].filter((s) => {
      if (agreementId && s.agreementId !== agreementId) return false;
      const agreement = this.agreements.get(s.agreementId);
      if (!agreement) return false;
      if (session.role === "admin") return true;
      if (session.role === "host") return agreement.floorId === session.floorId;
      return s.userId === session.userId;
    });
  }
}

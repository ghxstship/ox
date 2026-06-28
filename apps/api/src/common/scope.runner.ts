// Bridges a request Session to @ox/db withScope. Every scoped read/write runs
// inside a transaction whose Postgres GUCs (ox.user_id/role/floor_id) are set
// from the verified JWT, so the RLS policies do all row filtering. We never
// hand-filter rows here.
import { Injectable } from "@nestjs/common";
import { Prisma, withScope } from "@ox/db";
import type { Session } from "@ox/rbac";

@Injectable()
export class ScopeRunner {
  /** Run `fn` under the caller's RLS scope. */
  run<T>(session: Session, fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return withScope(
      { userId: session.userId, role: session.role, floorId: session.floorId ?? null },
      fn,
    );
  }
}

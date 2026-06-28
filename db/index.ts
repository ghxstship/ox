// @ox/db — the Prisma client + the RLS scope helper.
// `withScope` opens a transaction, sets the per-request GUCs the RLS policies
// read (ox.user_id / ox.role / ox.floor_id), then runs the callback inside it.
// IMPORTANT: connect as a NON-superuser, non-BYPASSRLS role in prod, or the
// policies in prisma/migrations/rls/policies.sql will not apply.
import { PrismaClient, Prisma } from "@prisma/client";

export * from "@prisma/client";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export interface RlsScope {
  userId: string;
  role: "member" | "coach" | "host" | "admin";
  floorId?: string | null;
}

/**
 * Run `fn` with the Postgres session GUCs set from the verified JWT, so RLS
 * filters every row automatically. SET LOCAL is transaction-scoped.
 */
export async function withScope<T>(scope: RlsScope, fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('ox.user_id', ${scope.userId}, true)`;
    await tx.$executeRaw`SELECT set_config('ox.role', ${scope.role}, true)`;
    await tx.$executeRaw`SELECT set_config('ox.floor_id', ${scope.floorId ?? ""}, true)`;
    return fn(tx);
  });
}

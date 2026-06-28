// Supabase data-access helper. Every DB read/write in the OX API goes through
// supabase-js (@ox/supabase) against the live project xaepcwnqjwphuwvuekfb.
//
//   forUser(token) → a per-request client that acts AS the caller (RLS applies).
//                    Pass the request's Supabase access token so auth.uid()
//                    resolves and the policies scope rows exactly like the apps.
//   service()      → the service-role client (BYPASSES RLS). Trusted server only:
//                    webhooks, automation firing, cross-user XP awards, payroll,
//                    minting payments — always with explicit floor/user guards.
//   unwrap(res)    → throw the OX error envelope on a PostgREST error / null row,
//                    else return the data.
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@ox/supabase/types";

// The OX Supabase clients are constructed here (rather than imported from
// `@ox/supabase/server`) so the API — which ts-node runs as CommonJS — never has
// to `require()` that package's ESM source. The behavior is identical: forUser()
// acts AS the caller (RLS applies); service() uses the service-role key (RLS
// bypass). Defaults match `@ox/supabase` and can be overridden via env.
type OxSupabase = ReturnType<typeof createClient<Database>>;

const OX_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xaepcwnqjwphuwvuekfb.supabase.co";
const OX_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ZzRzJgf-NQ3g5sR6i48m8g_HbMD_DMM";

function createServerClient(accessToken?: string): OxSupabase {
  return createClient<Database>(OX_SUPABASE_URL, OX_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

function createServiceClient(): OxSupabase {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for the service client");
  return createClient<Database>(OX_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface SupaError {
  message: string;
  code?: string;
  details?: string | null;
}

export interface SupaResult<T> {
  data: T | null;
  error: SupaError | null;
}

@Injectable()
export class SupaService {
  private serviceClient?: OxSupabase;

  /** Per-request client scoped to the caller via their access token (RLS applies). */
  forUser(accessToken?: string): OxSupabase {
    return createServerClient(accessToken);
  }

  /** Service-role client — BYPASSES RLS. Trusted server logic only. */
  service(): OxSupabase {
    this.serviceClient ??= createServiceClient();
    return this.serviceClient;
  }

  /**
   * Unwrap a supabase-js result: throw the OX error envelope on error, or 404 on
   * a null single-row result. Returns the data otherwise.
   */
  unwrap<R extends { data: unknown; error: unknown }>(res: R, notFound = "Not found."): NonNullable<R["data"]> {
    const err = res.error as SupaError | null;
    if (err) {
      throw new InternalServerErrorException({
        code: "internal",
        message: err.message || "Database error.",
        details: err.details ?? undefined,
      });
    }
    if (res.data === null || res.data === undefined) {
      throw new NotFoundException({ code: "not_found", message: notFound });
    }
    return res.data as NonNullable<R["data"]>;
  }

  /** Throw on error but allow a null result (e.g. maybeSingle / optional lookups). */
  unwrapMaybe<R extends { data: unknown; error: unknown }>(res: R): R["data"] {
    const err = res.error as SupaError | null;
    if (err) {
      throw new InternalServerErrorException({
        code: "internal",
        message: err.message || "Database error.",
        details: err.details ?? undefined,
      });
    }
    return res.data;
  }
}

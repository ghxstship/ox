// @ox/api-client — the transport core.
// JSON over HTTPS, bearer (JWT) auth, cursor pagination, a single Error envelope.
// The brand rules (one-accent/square/flat) live in the design layer, not here.
import type { ApiError } from "@ox/types";

export interface OxClientOptions {
  /** API base, e.g. https://api.ox.fit/v1 (defaults to env or /api/v1). */
  baseUrl?: string;
  /** Returns the current bearer token (JWT). Sync or async. */
  getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  /** Tenant slug -> sent as X-OX-Brand so the API can resolve the brand. */
  brand?: string;
  fetch?: typeof fetch;
}

export class OxApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  constructor(status: number, body: ApiError) {
    super(body.message || `OX API error ${status}`);
    this.name = "OxApiError";
    this.status = status;
    this.code = body.code || "unknown";
    this.details = body.details;
  }
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
  /** Skip the Authorization header (auth + public discovery routes). */
  anonymous?: boolean;
}

export class OxClient {
  private readonly opts: OxClientOptions;
  private readonly doFetch: typeof fetch;

  constructor(opts: OxClientOptions = {}) {
    this.opts = opts;
    this.doFetch = opts.fetch ?? globalThis.fetch;
    if (!this.doFetch) throw new Error("OxClient: no fetch implementation available");
  }

  private base(): string {
    return (
      this.opts.baseUrl ??
      (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_OX_API_URL : undefined) ??
      "/api/v1"
    );
  }

  async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(this.base().replace(/\/$/, "") + path, "http://_local_");
    const finalUrl = this.base().startsWith("http")
      ? buildUrl(this.base(), path, options.query)
      : buildUrl((typeof location !== "undefined" ? location.origin : "http://localhost") + this.base(), path, options.query) ||
        url.toString();

    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.opts.brand) headers["X-OX-Brand"] = this.opts.brand;
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (!options.anonymous && this.opts.getToken) {
      const token = await this.opts.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await this.doFetch(finalUrl, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });

    if (res.status === 204) return undefined as T;
    const text = await res.text();
    const json = text ? safeParse(text) : undefined;
    if (!res.ok) {
      throw new OxApiError(res.status, (json as ApiError) ?? { code: "http_error", message: res.statusText });
    }
    return json as T;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, options);
  }
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, { ...options, body });
  }
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", path, { ...options, body });
  }
  del<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }
}

function buildUrl(
  origin: string,
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
): string {
  const u = new URL(path.replace(/^\//, ""), origin.replace(/\/$/, "") + "/");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
    }
  }
  return u.toString();
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

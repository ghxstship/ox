// @ox/api-client — typed resource methods over the OX Platform API.
// One method per 03-api.md endpoint, grouped by domain. RLS is enforced
// server-side; list endpoints already return only the caller's visible rows.
import { OxClient, type OxClientOptions } from "./client.js";
import type {
  Booking,
  BrandConfig,
  Class,
  EventModel,
  Exercise,
  Membership,
  Order,
  Page,
  Payment,
  PR,
  Product,
  Recovery,
  Ticket,
  User,
  WorkoutSession,
} from "@ox/types";

// Session type isn't in @ox/types entities; re-declare the auth response shape.
export interface AuthSession {
  userId: string;
  name: string;
  initial: string;
  role: User["role"];
  floorId: string | null;
  floors: string[];
  level?: number;
  xp?: number;
  homeFloor?: string;
}

export interface AuthResult {
  jwt: string;
  session: AuthSession;
}

export function createOxApi(opts: OxClientOptions = {}) {
  const http = new OxClient(opts);
  return {
    http,

    // ── Auth ──────────────────────────────────────────────
    auth: {
      otpStart: (body: { email?: string; phone?: string }) =>
        http.post<{ id: string }>("/auth/otp/start", body, { anonymous: true }),
      otpVerify: (body: { id: string; code: string }) =>
        http.post<AuthResult>("/auth/otp/verify", body, { anonymous: true }),
      signout: () => http.post<void>("/auth/signout"),
    },

    // ── Me ────────────────────────────────────────────────
    me: {
      get: () => http.get<User>("/me"),
      progress: () => http.get<{ prs: PR[]; level: number; xp: number }>("/me/progress"),
      recovery: () => http.get<Recovery[]>("/me/recovery"),
      prs: () => http.get<PR[]>("/me/prs"),
      orders: () => http.get<Page<Order>>("/me/orders"),
      credential: () => http.get<Record<string, unknown>>("/me/credential"),
    },

    // ── Tenant / white-label ──────────────────────────────
    tenant: {
      brand: () => http.get<BrandConfig>("/tenant/brand", { anonymous: true }),
    },

    // ── Floors ────────────────────────────────────────────
    floors: {
      list: () => http.get<Page<Floor_>>("/floors"),
      get: (floorId: string) => http.get<Floor_>(`/floors/${floorId}`),
    },

    // ── Training ──────────────────────────────────────────
    training: {
      exercises: (q?: { muscle?: string; equipment?: string; q?: string }) =>
        http.get<Page<Exercise>>("/exercises", { query: q }),
      floorMatches: (exerciseId: string) => http.get<unknown>(`/exercises/${exerciseId}/floor-matches`),
      generate: (body: { focus: string; equipment: string[]; experience: string; goal: string }) =>
        http.post<WorkoutSession>("/workouts/generate", body),
      start: (body: { floorId?: string; scenery?: string }) => http.post<WorkoutSession>("/workouts", body),
      logSet: (sessionId: string, body: { exerciseId: string; index: number; weight?: number; reps: number; rpe?: number; done: boolean }) =>
        http.post<WorkoutSession>(`/workouts/${sessionId}/sets`, body),
      finish: (sessionId: string) => http.post<WorkoutSession>(`/workouts/${sessionId}/finish`),
    },

    // ── Classes & booking ─────────────────────────────────
    classes: {
      list: (q?: { from?: string; to?: string }) => http.get<Page<Class>>("/classes", { query: q }),
      create: (body: Partial<Class>) => http.post<Class>("/classes", body),
      update: (id: string, body: Partial<Class>) => http.patch<Class>(`/classes/${id}`, body),
      remove: (id: string) => http.del<void>(`/classes/${id}`),
      book: (id: string) => http.post<Booking>(`/classes/${id}/book`),
      roster: (id: string) => http.get<User[]>(`/classes/${id}/roster`),
      checkin: (id: string, body: { userId: string }) => http.post<Booking>(`/classes/${id}/checkin`, body),
    },
    bookings: {
      cancel: (id: string) => http.post<Booking>(`/bookings/${id}/cancel`),
    },

    // ── Events & tickets ──────────────────────────────────
    events: {
      list: () => http.get<Page<EventModel>>("/events", { anonymous: true }),
      get: (id: string) => http.get<EventModel>(`/events/${id}`, { anonymous: true }),
      create: (body: Partial<EventModel>) => http.post<EventModel>("/events", body),
      rsvp: (id: string, body?: { tierId?: string }) => http.post<Ticket>(`/events/${id}/rsvp`, body),
      tickets: (id: string, body: { tierId: string }) => http.post<Ticket>(`/events/${id}/tickets`, body),
      analytics: (id: string) => http.get<unknown>(`/events/${id}/analytics`),
    },
    tickets: {
      checkin: (id: string) => http.post<Ticket>(`/tickets/${id}/checkin`),
    },
    raids: {
      join: (id: string) => http.post<Ticket>(`/raids/${id}/join`),
    },

    // ── Commerce ──────────────────────────────────────────
    shop: {
      products: (q?: { collection?: string }) => http.get<Page<Product>>("/products", { query: q }),
      cart: () => http.get<Order>("/cart"),
      addItem: (body: { productId: string; size: string; qty: number }) => http.post<Order>("/cart/items", body),
      removeItem: (id: string) => http.del<Order>(`/cart/items/${id}`),
      checkout: (body: { address?: unknown; shipping?: string }) => http.post<Order>("/checkout", body),
    },

    // ── Operator / CRM / billing ──────────────────────────
    ops: {
      members: () => http.get<Page<User>>("/members"),
      member: (id: string) => http.get<User>(`/members/${id}`),
      clients: () => http.get<Page<User>>("/clients"),
      payments: () => http.get<Page<Payment>>("/payments"),
      retryPayment: (id: string) => http.post<Payment>(`/payments/${id}/retry`),
      memberships: () => http.get<Page<Membership>>("/memberships"),
      report: (name: string) => http.get<unknown>(`/reports/${name}`),
      campaign: (body: { channel: "sms" | "email"; subject?: string; body: string }) =>
        http.post<unknown>("/campaigns", body),
    },

    // ── Admin ─────────────────────────────────────────────
    admin: {
      floors: () => http.get<Page<Floor_>>("/admin/floors"),
      challenges: () => http.get<unknown>("/admin/challenges"),
      staff: () => http.get<Page<User>>("/admin/staff"),
      analytics: () => http.get<unknown>("/admin/analytics"),
    },

    // ── Social ────────────────────────────────────────────
    social: {
      leaderboard: (tribeId: string) => http.get<unknown>(`/tribes/${tribeId}/leaderboard`),
      checkin: (body: { floorId: string }) => http.post<unknown>("/checkins", body),
    },

    // ── Media pairings ────────────────────────────────────
    media: {
      pairings: () => http.get<unknown>("/pairings"),
      upvote: (pairingId: string) => http.post<unknown>(`/pairings/${pairingId}/upvote`),
    },
  };
}

// Floor type isn't exported from entities barrel under this name; alias here.
type Floor_ = import("@ox/types").Floor;

export type OxApi = ReturnType<typeof createOxApi>;
export { OxClient, OxApiError } from "./client.js";
export type { OxClientOptions, RequestOptions } from "./client.js";

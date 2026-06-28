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

// ── Parity / consumer entity shapes (not yet in @ox/types) ─────────────
export type LeadStage = "lead" | "tour" | "trial" | "member" | "lost";
export interface LeadActivity {
  id: string;
  leadId: string;
  floorId: string;
  kind: string;
  note: string;
  at: string;
}
export interface Lead {
  id: string;
  floorId: string;
  name: string;
  contact: string;
  source: string;
  stage: LeadStage;
  notes?: string | null;
  valueCents: number;
  createdAt: string;
  updatedAt: string;
  activity: LeadActivity[];
}

export type AutomationTrigger = "signup" | "booking" | "missed_class" | "membership_lapsed";
export interface Automation {
  id: string;
  floorId: string;
  name?: string | null;
  trigger: AutomationTrigger;
  action: string;
  delayHours: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShiftKind = "class" | "floor" | "open";
export interface Shift {
  id: string;
  floorId: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  kind: ShiftKind;
  coverRequested: boolean;
  createdAt: string;
}

export interface Agreement {
  id: string;
  floorId: string;
  title: string;
  body: string;
  version: number;
  archived: boolean;
  createdAt: string;
}
export interface Signature {
  id: string;
  agreementId: string;
  floorId: string;
  userId: string;
  dataUrl: string;
  signedAt: string;
}

export type NotificationKind = "system" | "coach" | "social" | "commerce" | "booking" | "quest";
export interface Notification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
}

export interface BodyMetric {
  id: string;
  userId: string;
  at: string;
  weightLb?: number | null;
  bodyFatPct?: number | null;
  restingHr?: number | null;
  notes?: string | null;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string;
}

export interface ShippingAddress {
  id: string;
  userId: string;
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postal: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
  createdAt: string;
}

export type CreditReason = "purchase" | "booking" | "refund" | "gift" | "adjustment" | "referral";
export interface CreditLedgerEntry {
  id: string;
  userId: string;
  delta: number;
  balanceAfter: number;
  reason: CreditReason;
  note?: string | null;
  at: string;
}
export interface CreditWallet {
  balance: number;
  entries: CreditLedgerEntry[];
}

export interface Pack {
  id: string;
  floorId?: string | null;
  name: string;
  credits: number;
  priceCents: number;
  active: boolean;
  createdAt: string;
}
export interface UserPack {
  id: string;
  userId: string;
  packId: string;
  creditsRemaining: number;
  purchasedAt: string;
  expiresAt?: string | null;
}

export interface GiftCard {
  id: string;
  code: string;
  balanceCents: number;
  initialCents: number;
  purchaserId?: string | null;
  recipientEmail?: string | null;
  redeemedById?: string | null;
  createdAt: string;
}

export type DiscountKind = "percent" | "fixed";
export interface PromoQuote {
  code: string;
  kind: DiscountKind;
  value: number;
  subtotalCents: number;
  discountCents: number;
  totalAfterCents: number;
}

export interface Waiver {
  id: string;
  floorId?: string | null;
  title: string;
  body: string;
  version: number;
  createdAt: string;
}
export interface WaiverSignature {
  id: string;
  waiverId: string;
  userId: string;
  signedAt: string;
}

export type HealthProvider = "apple_health" | "google_fit" | "garmin" | "whoop" | "fitbit";
export interface HealthConnection {
  id: string;
  userId: string;
  provider: HealthProvider;
  status: string;
  connectedAt: string;
}

export interface GuestPass {
  id: string;
  userId: string;
  code: string;
  guestName?: string | null;
  usedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface OnboardingState {
  userId: string;
  step: number;
  completed: boolean;
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface PaymentMint {
  clientSecret: string;
  mock: boolean;
  id?: string;
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

      // Notifications
      notifications: () => http.get<Notification[]>("/me/notifications"),
      readNotification: (id: string) => http.post<Notification>(`/me/notifications/${id}/read`),
      readAllNotifications: () => http.post<{ updated: number }>("/me/notifications/read-all"),

      // Body metrics
      body: () => http.get<BodyMetric[]>("/me/body"),
      addBody: (body: { weightLb?: number; bodyFatPct?: number; restingHr?: number; notes?: string }) =>
        http.post<BodyMetric>("/me/body", body),

      // Wishlist
      wishlist: () => http.get<WishlistItem[]>("/me/wishlist"),
      addWishlist: (body: { productId: string }) => http.post<WishlistItem>("/me/wishlist", body),
      removeWishlist: (productId: string) => http.del<{ removed: boolean }>(`/me/wishlist/${productId}`),

      // Addresses
      addresses: () => http.get<ShippingAddress[]>("/me/addresses"),
      createAddress: (body: Partial<ShippingAddress> & { name: string; line1: string; city: string; region: string; postal: string }) =>
        http.post<ShippingAddress>("/me/addresses", body),
      updateAddress: (id: string, body: Partial<ShippingAddress>) =>
        http.patch<ShippingAddress>(`/me/addresses/${id}`, body),
      deleteAddress: (id: string) => http.del<{ removed: boolean }>(`/me/addresses/${id}`),

      // Wallet / credits
      credits: () => http.get<CreditWallet>("/me/credits"),

      // Waivers (signed)
      signedWaivers: () => http.get<WaiverSignature[]>("/me/waivers"),

      // Health connections
      health: () => http.get<HealthConnection[]>("/me/health"),
      connectHealth: (body: { provider: HealthProvider }) => http.post<HealthConnection>("/me/health/connect", body),
      disconnectHealth: (provider: HealthProvider) => http.del<{ disconnected: boolean }>(`/me/health/${provider}`),

      // Guest passes
      guestPasses: () => http.get<GuestPass[]>("/me/guest-passes"),
      mintGuestPass: (body?: { guestName?: string }) => http.post<GuestPass>("/me/guest-passes", body),

      // Onboarding
      onboarding: () => http.get<OnboardingState>("/me/onboarding"),
      saveOnboarding: (body: { step?: number; completed?: boolean; data?: Record<string, unknown> }) =>
        http.request<OnboardingState>("PUT", "/me/onboarding", { body }),
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
      checkout: (body?: { address?: unknown; shipping?: string; promoCode?: string }) =>
        http.post<{ order: Order; subtotalCents: number; discountCents: number; totalCents: number; payment: PaymentMint }>(
          "/checkout",
          body ?? {},
        ),

      // Product reviews (public read, member write)
      reviews: (productId: string) => http.get<ProductReview[]>(`/products/${productId}/reviews`, { anonymous: true }),
      addReview: (productId: string, body: { rating: number; title?: string; body?: string }) =>
        http.post<ProductReview>(`/products/${productId}/reviews`, body),

      // Promo
      applyPromo: (body: { code: string }) => http.post<PromoQuote>("/cart/promo", body),

      // Credit packs
      packs: () => http.get<Pack[]>("/packs", { anonymous: true }),
      buyPack: (id: string) => http.post<{ userPack: UserPack; payment: PaymentMint }>(`/packs/${id}/buy`),

      // Gift cards
      buyGiftCard: (body: { amountCents: number; recipientEmail?: string }) =>
        http.post<{ card: GiftCard; payment: PaymentMint }>("/giftcards", body),
      redeemGiftCard: (body: { code: string }) =>
        http.post<{ card: GiftCard; ledger: CreditLedgerEntry }>("/giftcards/redeem", body),

      // Waivers (floor templates)
      waivers: () => http.get<Waiver[]>("/waivers"),
      signWaiver: (id: string) => http.post<WaiverSignature>(`/waivers/${id}/sign`),
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

    // ── Operator parity: leads, automations, staff, contracts ──
    parity: {
      // Lead / prospect pipeline
      leads: (q?: { stage?: LeadStage }) => http.get<Lead[]>("/leads", { query: q }),
      createLead: (body: { name: string; contact: string; source?: string; floorId?: string; valueCents?: number; notes?: string }) =>
        http.post<Lead>("/leads", body),
      advanceLead: (id: string, body: { stage: LeadStage; note?: string }) =>
        http.post<Lead>(`/leads/${id}/stage`, body),
      convertLead: (id: string) => http.post<{ lead: Lead; userId: string }>(`/leads/${id}/convert`),

      // Automation builder
      automations: () => http.get<Automation[]>("/automations"),
      createAutomation: (body: { trigger: AutomationTrigger; action: string; delayHours?: number; floorId?: string; name?: string }) =>
        http.post<Automation>("/automations", body),
      toggleAutomation: (id: string, body?: { enabled?: boolean }) =>
        http.post<Automation>(`/automations/${id}/toggle`, body),

      // Staff scheduling / shifts
      shifts: () => http.get<Shift[]>("/staff/shifts"),
      createShift: (body: { staffId?: string; startsAt: string; endsAt: string; kind?: ShiftKind; floorId?: string }) =>
        http.post<Shift>("/staff/shifts", body),
      requestCover: (id: string) => http.post<Shift>(`/staff/shifts/${id}/cover`),

      // Contracts / e-sign
      contracts: () => http.get<Agreement[]>("/contracts"),
      createContract: (body: { title: string; body: string; floorId?: string }) =>
        http.post<Agreement>("/contracts", body),
      signContract: (id: string, body: { dataUrl: string }) => http.post<Signature>(`/contracts/${id}/sign`, body),
      contractArchive: (q?: { agreementId?: string }) => http.get<Signature[]>("/contracts/archive", { query: q }),
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

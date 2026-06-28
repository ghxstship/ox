// Consumer parity surfaces (11 §B consumer side). Notifications, body metrics,
// wishlist, product reviews, shipping addresses, waivers, health connections,
// guest passes, onboarding — every member-owned table is scoped by
// `userId = session.userId` through Supabase (RLS) with explicit userId filters
// so a member only ever touches their own rows.
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import type { Json } from "@ox/supabase/types";
import type { Session } from "@ox/rbac";
import { randomBytes } from "node:crypto";
import { SupaService } from "../common/supa.service";
import type {
  ConnectHealthDto,
  CreateAddressDto,
  CreateBodyMetricDto,
  CreateReviewDto,
  UpdateAddressDto,
  UpsertOnboardingDto,
} from "./consumer.dto";

export type HealthProvider = "apple_health" | "google_fit" | "garmin" | "whoop" | "fitbit";

@Injectable()
export class ConsumerService {
  constructor(private readonly supa: SupaService) {}

  // ── Notifications ──────────────────────────────────────────────────
  async notifications(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("Notification")
      .select("*")
      .eq("userId", session.userId)
      .order("createdAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  async markNotificationRead(session: Session, token: string | undefined, id: string) {
    const sb = this.supa.forUser(token);
    const { data: note, error: readErr } = await sb
      .from("Notification")
      .select("id")
      .eq("id", id)
      .eq("userId", session.userId)
      .maybeSingle();
    if (readErr) throw new InternalServerErrorException({ code: "internal", message: readErr.message });
    if (!note) throw new NotFoundException({ code: "not_found", message: "No notification." });
    const { data, error } = await sb
      .from("Notification")
      .update({ read: true })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async markAllNotificationsRead(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("Notification")
      .update({ read: true })
      .eq("userId", session.userId)
      .eq("read", false)
      .select("id");
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return { updated: data?.length ?? 0 };
  }

  // ── Body metrics ───────────────────────────────────────────────────
  async bodyMetrics(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("BodyMetric")
      .select("*")
      .eq("userId", session.userId)
      .order("at", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  async addBodyMetric(session: Session, token: string | undefined, dto: CreateBodyMetricDto) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("BodyMetric")
      .insert({
        userId: session.userId,
        weightLb: dto.weightLb,
        bodyFatPct: dto.bodyFatPct,
        restingHr: dto.restingHr,
        notes: dto.notes,
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  // ── Wishlist ───────────────────────────────────────────────────────
  async wishlist(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("WishlistItem")
      .select("*")
      .eq("userId", session.userId)
      .order("createdAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  async addWishlist(session: Session, token: string | undefined, productId: string) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("WishlistItem")
      .upsert({ userId: session.userId, productId }, { onConflict: "userId,productId" })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async removeWishlist(session: Session, token: string | undefined, productId: string) {
    const sb = this.supa.forUser(token);
    const { error } = await sb
      .from("WishlistItem")
      .delete()
      .eq("userId", session.userId)
      .eq("productId", productId);
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return { removed: true };
  }

  // ── Product reviews ────────────────────────────────────────────────
  // Public read — no token needed; uses the anon client (public-read table).
  async productReviews(productId: string) {
    const sb = this.supa.forUser();
    const { data, error } = await sb
      .from("ProductReview")
      .select("*")
      .eq("productId", productId)
      .order("createdAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  async addReview(session: Session, token: string | undefined, productId: string, dto: CreateReviewDto) {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new ForbiddenException({ code: "bad_request", message: "Rating must be 1–5." });
    }
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("ProductReview")
      .upsert(
        { productId, userId: session.userId, rating: dto.rating, title: dto.title, body: dto.body ?? "" },
        { onConflict: "productId,userId" },
      )
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  // ── Shipping addresses ─────────────────────────────────────────────
  async addresses(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("ShippingAddress")
      .select("*")
      .eq("userId", session.userId)
      .order("createdAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  async createAddress(session: Session, token: string | undefined, dto: CreateAddressDto) {
    const sb = this.supa.forUser(token);
    if (dto.isDefault) {
      const { error: clearErr } = await sb
        .from("ShippingAddress")
        .update({ isDefault: false })
        .eq("userId", session.userId);
      if (clearErr) throw new InternalServerErrorException({ code: "internal", message: clearErr.message });
    }
    const { data, error } = await sb
      .from("ShippingAddress")
      .insert({
        userId: session.userId,
        name: dto.name,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        region: dto.region,
        postal: dto.postal,
        country: dto.country ?? "US",
        phone: dto.phone,
        isDefault: dto.isDefault ?? false,
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async updateAddress(session: Session, token: string | undefined, id: string, dto: UpdateAddressDto) {
    const sb = this.supa.forUser(token);
    const { data: existing, error: existErr } = await sb
      .from("ShippingAddress")
      .select("id")
      .eq("id", id)
      .eq("userId", session.userId)
      .maybeSingle();
    if (existErr) throw new InternalServerErrorException({ code: "internal", message: existErr.message });
    if (!existing) throw new NotFoundException({ code: "not_found", message: "No address." });
    if (dto.isDefault) {
      const { error: clearErr } = await sb
        .from("ShippingAddress")
        .update({ isDefault: false })
        .eq("userId", session.userId);
      if (clearErr) throw new InternalServerErrorException({ code: "internal", message: clearErr.message });
    }
    const { data, error } = await sb
      .from("ShippingAddress")
      .update({
        name: dto.name,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        region: dto.region,
        postal: dto.postal,
        country: dto.country,
        phone: dto.phone,
        isDefault: dto.isDefault,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async deleteAddress(session: Session, token: string | undefined, id: string) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("ShippingAddress")
      .delete()
      .eq("id", id)
      .eq("userId", session.userId)
      .select("id");
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    if (!data || data.length === 0) throw new NotFoundException({ code: "not_found", message: "No address." });
    return { removed: true };
  }

  // ── Waivers ────────────────────────────────────────────────────────
  // Floor waivers (or global, floorId null) — visible to the member on their floor.
  async waivers(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("Waiver")
      .select("*")
      .or(`floorId.is.null,floorId.eq.${session.floorId ?? "__none__"}`)
      .order("createdAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  async signWaiver(session: Session, token: string | undefined, waiverId: string) {
    const sb = this.supa.forUser(token);
    const { data: waiver, error: wErr } = await sb
      .from("Waiver")
      .select("id")
      .eq("id", waiverId)
      .maybeSingle();
    if (wErr) throw new InternalServerErrorException({ code: "internal", message: wErr.message });
    if (!waiver) throw new NotFoundException({ code: "not_found", message: "No waiver." });
    const { data, error } = await sb
      .from("WaiverSignature")
      .upsert({ waiverId, userId: session.userId }, { onConflict: "waiverId,userId" })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async signedWaivers(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("WaiverSignature")
      .select("*")
      .eq("userId", session.userId)
      .order("signedAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  // ── Health connections ─────────────────────────────────────────────
  async healthConnections(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("HealthConnection")
      .select("*")
      .eq("userId", session.userId)
      .order("connectedAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  async connectHealth(session: Session, token: string | undefined, dto: ConnectHealthDto) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("HealthConnection")
      .upsert(
        { userId: session.userId, provider: dto.provider, status: "connected", connectedAt: new Date().toISOString() },
        { onConflict: "userId,provider" },
      )
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async disconnectHealth(session: Session, token: string | undefined, provider: HealthProvider) {
    const sb = this.supa.forUser(token);
    const { error } = await sb
      .from("HealthConnection")
      .delete()
      .eq("userId", session.userId)
      .eq("provider", provider);
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return { disconnected: true };
  }

  // ── Guest passes ───────────────────────────────────────────────────
  async guestPasses(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("GuestPass")
      .select("*")
      .eq("userId", session.userId)
      .order("createdAt", { ascending: false });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  async mintGuestPass(session: Session, token: string | undefined, guestName?: string) {
    const code = `OX-${randomBytes(4).toString("hex").toUpperCase()}`;
    // Passes lapse after 30 days — a sensible OX default for a single visit.
    const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const sb = this.supa.forUser(token);
    const { data, error } = await sb
      .from("GuestPass")
      .insert({ userId: session.userId, code, guestName, expiresAt })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  // ── Onboarding ─────────────────────────────────────────────────────
  async onboarding(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data: state, error } = await sb
      .from("OnboardingState")
      .select("*")
      .eq("userId", session.userId)
      .maybeSingle();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return state ?? { userId: session.userId, step: 0, completed: false, data: {}, updatedAt: new Date().toISOString() };
  }

  async upsertOnboarding(session: Session, token: string | undefined, dto: UpsertOnboardingDto) {
    const sb = this.supa.forUser(token);
    const data = (dto.data ?? {}) as Json;
    const { data: existing, error: readErr } = await sb
      .from("OnboardingState")
      .select("*")
      .eq("userId", session.userId)
      .maybeSingle();
    if (readErr) throw new InternalServerErrorException({ code: "internal", message: readErr.message });
    const row = existing
      ? {
          userId: session.userId,
          ...(dto.step !== undefined ? { step: dto.step } : {}),
          ...(dto.completed !== undefined ? { completed: dto.completed } : {}),
          ...(dto.data !== undefined ? { data } : {}),
          updatedAt: new Date().toISOString(),
        }
      : {
          userId: session.userId,
          step: dto.step ?? 0,
          completed: dto.completed ?? false,
          data,
          updatedAt: new Date().toISOString(),
        };
    const { data: result, error } = await sb
      .from("OnboardingState")
      .upsert(row, { onConflict: "userId" })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return result;
  }
}

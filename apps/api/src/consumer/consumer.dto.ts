import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

// ── Body metrics ─────────────────────────────────────────────────────
export class CreateBodyMetricDto {
  @IsNumber() @IsOptional() weightLb?: number;
  @IsNumber() @IsOptional() bodyFatPct?: number;
  @IsInt() @IsOptional() restingHr?: number;
  @IsString() @IsOptional() notes?: string;
}

// ── Wishlist ──────────────────────────────────────────────────────────
export class AddWishlistDto {
  @IsString() productId!: string;
}

// ── Reviews ───────────────────────────────────────────────────────────
export class CreateReviewDto {
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() body?: string;
}

// ── Addresses ─────────────────────────────────────────────────────────
export class CreateAddressDto {
  @IsString() name!: string;
  @IsString() line1!: string;
  @IsString() @IsOptional() line2?: string;
  @IsString() city!: string;
  @IsString() region!: string;
  @IsString() postal!: string;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() phone?: string;
  @IsBoolean() @IsOptional() isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() line1?: string;
  @IsString() @IsOptional() line2?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() region?: string;
  @IsString() @IsOptional() postal?: string;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() phone?: string;
  @IsBoolean() @IsOptional() isDefault?: boolean;
}

// ── Packs / gift cards / promo ────────────────────────────────────────
export class BuyGiftCardDto {
  @IsInt() @Min(1) amountCents!: number;
  @IsEmail() @IsOptional() recipientEmail?: string;
}

export class RedeemGiftCardDto {
  @IsString() code!: string;
}

export class PromoDto {
  @IsString() code!: string;
}

// ── Health ────────────────────────────────────────────────────────────
const HEALTH_PROVIDERS = ["apple_health", "google_fit", "garmin", "whoop", "fitbit"] as const;
export class ConnectHealthDto {
  @IsIn(HEALTH_PROVIDERS) provider!: (typeof HEALTH_PROVIDERS)[number];
}

// ── Guest passes ──────────────────────────────────────────────────────
export class MintGuestPassDto {
  @IsString() @IsOptional() guestName?: string;
}

// ── Onboarding ────────────────────────────────────────────────────────
export class UpsertOnboardingDto {
  @IsInt() @Min(0) @IsOptional() step?: number;
  @IsBoolean() @IsOptional() completed?: boolean;
  @IsObject() @IsOptional() data?: Record<string, unknown>;
}

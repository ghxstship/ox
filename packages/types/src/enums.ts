// @ox/types — domain enums. Single source of truth shared by client + server,
// mirroring the Prisma enums in 02-data-model.md / db/prisma/schema.prisma.
// Use OX vocabulary; tiers/levels/zones are tonal copper steps, never new hues.

export const ROLES = ["member", "coach", "host", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const TIERS = ["compass", "sound", "distant", "founder"] as const;
export type Tier = (typeof TIERS)[number];

export const CLASS_LOADS = ["open", "fill", "full"] as const;
export type ClassLoad = (typeof CLASS_LOADS)[number];

export const BOOKING_STATES = ["booked", "waitlist", "attended", "late_cancel", "no_show", "cancelled"] as const;
export type BookingState = (typeof BOOKING_STATES)[number];

export const PAY_STATES = ["pending", "paid", "failed", "refunded"] as const;
export type PayState = (typeof PAY_STATES)[number];

export const ORDER_STATES = ["cart", "placed", "paid", "fulfilled", "cancelled"] as const;
export type OrderState = (typeof ORDER_STATES)[number];

export const TICKET_STATES = ["reserved", "paid", "checked_in", "refunded"] as const;
export type TicketState = (typeof TICKET_STATES)[number];

export const SCENERY = ["oceanfront", "rooftop", "industrial", "sunrise", "forest"] as const;
export type Scenery = (typeof SCENERY)[number];

export const MUSCLES = ["push", "pull", "legs", "core", "full_body", "arms", "back", "chest", "glutes"] as const;
export type Muscle = (typeof MUSCLES)[number];

export const EQUIPMENT = ["barbell", "dumbbell", "kettlebell", "cable", "machine", "band", "bodyweight", "trx"] as const;
export type Equipment = (typeof EQUIPMENT)[number];

/** RPE 6..10 (smallint in practice). */
export type RPE = 6 | 7 | 8 | 9 | 10;

export const RECOVERY_STATES = ["fresh", "light", "worked", "spent"] as const;
export type RecoveryState = (typeof RECOVERY_STATES)[number];

export const MEMBERSHIP_STATUSES = ["active", "paused", "cancelled", "past_due"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

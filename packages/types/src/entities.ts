// @ox/types — domain entities (02-data-model.md). Hand-authored, framework-free;
// the Prisma models in db/prisma/schema.prisma are the storage projection of these.
import type {
  BookingState,
  ClassLoad,
  Equipment,
  MembershipStatus,
  Muscle,
  OrderState,
  PayState,
  RecoveryState,
  Role,
  Scenery,
  TicketState,
  Tier,
} from "./enums.js";

export interface User {
  id: string;
  name: string;
  email: string;
  initial: string;
  role: Role;
  level: number;
  xp: number;
  homeFloorId?: string | null;
  coachId?: string | null;
  floorId?: string | null;
}

export interface Floor {
  id: string;
  name: string;
  scenery: Scenery;
  hostId: string;
  address?: string | null;
  geo?: { lat: number; lng: number } | null;
}

export interface FloorEquipment {
  id: string;
  floorId: string;
  equipment: Equipment;
  count: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscles: Muscle[];
  equipment: Equipment[];
  demoUrl?: string | null;
  cue?: string | null;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  floorId?: string | null;
  scenery?: Scenery | null;
  startedAt: string;
  endedAt?: string | null;
  xpAwarded: number;
  sets?: SetLog[];
}

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  index: number;
  weight?: number | null;
  reps: number;
  rpe?: number | null;
  done: boolean;
}

export interface PR {
  id: string;
  userId: string;
  lift: string;
  value: number;
  unit: string;
  at: string;
}

export interface Recovery {
  userId: string;
  muscle: Muscle;
  state: RecoveryState;
}

export interface Class {
  id: string;
  title: string;
  floorId: string;
  coachId: string;
  startsAt: string;
  capacity: number;
  load: ClassLoad;
  recurRule?: string | null;
}

export interface Booking {
  id: string;
  classId: string;
  userId: string;
  state: BookingState;
  waitlistPos?: number | null;
  createdAt: string;
}

export interface EventModel {
  id: string;
  title: string;
  floorId?: string | null;
  hostName: string;
  startsAt: string;
  rewardXp: number;
  capacity?: number | null;
  isRaid: boolean;
  tiers?: TicketTier[];
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  priceCents: number;
  qty: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  tierId: string;
  userId: string;
  state: TicketState;
  qrCode: string;
  checkedInAt?: string | null;
}

export interface Membership {
  id: string;
  userId: string;
  floorId: string;
  tier: Tier;
  addOns: string[];
  status: MembershipStatus;
  renewsAt?: string | null;
  stripeSubId?: string | null;
}

export interface Payment {
  id: string;
  userId: string;
  floorId: string;
  kind: string;
  amountCents: number;
  state: PayState;
  stripePiId?: string | null;
  at: string;
}

export interface Product {
  id: string;
  name: string;
  priceCents: number;
  collection: string;
  sizes: string[];
  colors: string[];
  imageUrl?: string | null;
  gateLevel: number;
}

export interface Order {
  id: string;
  userId: string;
  state: OrderState;
  totalCents: number;
  items: OrderItem[];
  placedAt?: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  size: string;
  qty: number;
  priceCents: number;
}

/** White-label brand config — mirrors whitelabel/brand.schema.json. */
export interface BrandConfig {
  slug: string;
  name: string;
  mark?: string;
  accent: string;
  accentDeep?: string;
  accentBright?: string;
  ground?: string;
  raised?: string;
  deep?: string;
  ink?: string;
  inkSoft?: string;
  fontDisplay?: string;
  fontBody?: string;
  fontMono?: string;
  mode?: "light" | "dark" | "auto";
  logo?: string;
}

/** Standard error envelope (OpenAPI `Error`). */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Page<T> {
  data: T[];
  nextCursor?: string | null;
}

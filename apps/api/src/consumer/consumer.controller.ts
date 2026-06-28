// Consumer-parity HTTP surface. Member-owned routes live under /me and are
// gated by self.view (RLS scopes rows to the caller). Public product reviews and
// the active pack list are @Public. Store mutations (packs, gift cards, promo)
// require shop.buy.
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req } from "@nestjs/common";
import { Capability, CurrentSession, Public } from "../common/decorators";
import type { OxRequest, Session } from "../common/session";
import { ConsumerService, type HealthProvider } from "./consumer.service";
import { WalletService } from "./wallet.service";
import {
  AddWishlistDto,
  BuyGiftCardDto,
  ConnectHealthDto,
  CreateAddressDto,
  CreateBodyMetricDto,
  CreateReviewDto,
  MintGuestPassDto,
  PromoDto,
  RedeemGiftCardDto,
  UpdateAddressDto,
  UpsertOnboardingDto,
} from "./consumer.dto";
import { StoreService } from "./store.service";

// ── /me — member-owned consumer surfaces ────────────────────────────────
@Controller("me")
export class MeConsumerController {
  constructor(private readonly consumer: ConsumerService) {}

  // Notifications
  @Get("notifications")
  @Capability("self.view")
  notifications(@CurrentSession() session: Session) {
    return this.consumer.notifications(session);
  }

  @Post("notifications/:id/read")
  @Capability("self.view")
  readNotification(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.consumer.markNotificationRead(session, id);
  }

  @Post("notifications/read-all")
  @Capability("self.view")
  readAllNotifications(@CurrentSession() session: Session) {
    return this.consumer.markAllNotificationsRead(session);
  }

  // Body metrics
  @Get("body")
  @Capability("self.view")
  body(@CurrentSession() session: Session) {
    return this.consumer.bodyMetrics(session);
  }

  @Post("body")
  @Capability("self.view")
  addBody(@CurrentSession() session: Session, @Body() dto: CreateBodyMetricDto) {
    return this.consumer.addBodyMetric(session, dto);
  }

  // Wishlist
  @Get("wishlist")
  @Capability("self.view")
  wishlist(@CurrentSession() session: Session) {
    return this.consumer.wishlist(session);
  }

  @Post("wishlist")
  @Capability("shop.buy")
  addWishlist(@CurrentSession() session: Session, @Body() dto: AddWishlistDto) {
    return this.consumer.addWishlist(session, dto.productId);
  }

  @Delete("wishlist/:productId")
  @Capability("shop.buy")
  removeWishlist(@CurrentSession() session: Session, @Param("productId") productId: string) {
    return this.consumer.removeWishlist(session, productId);
  }

  // Addresses
  @Get("addresses")
  @Capability("self.view")
  addresses(@CurrentSession() session: Session) {
    return this.consumer.addresses(session);
  }

  @Post("addresses")
  @Capability("self.view")
  createAddress(@CurrentSession() session: Session, @Body() dto: CreateAddressDto) {
    return this.consumer.createAddress(session, dto);
  }

  @Patch("addresses/:id")
  @Capability("self.view")
  updateAddress(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: UpdateAddressDto) {
    return this.consumer.updateAddress(session, id, dto);
  }

  @Delete("addresses/:id")
  @Capability("self.view")
  deleteAddress(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.consumer.deleteAddress(session, id);
  }

  // Signed waivers (the templates live under /waivers, see StoreController)
  @Get("waivers")
  @Capability("self.view")
  signedWaivers(@CurrentSession() session: Session) {
    return this.consumer.signedWaivers(session);
  }

  // Health connections
  @Get("health")
  @Capability("self.view")
  health(@CurrentSession() session: Session) {
    return this.consumer.healthConnections(session);
  }

  @Post("health/connect")
  @Capability("self.view")
  connectHealth(@CurrentSession() session: Session, @Body() dto: ConnectHealthDto) {
    return this.consumer.connectHealth(session, dto);
  }

  @Delete("health/:provider")
  @Capability("self.view")
  disconnectHealth(@CurrentSession() session: Session, @Param("provider") provider: HealthProvider) {
    return this.consumer.disconnectHealth(session, provider);
  }

  // Guest passes
  @Get("guest-passes")
  @Capability("self.view")
  guestPasses(@CurrentSession() session: Session) {
    return this.consumer.guestPasses(session);
  }

  @Post("guest-passes")
  @Capability("self.view")
  mintGuestPass(@CurrentSession() session: Session, @Body() dto: MintGuestPassDto) {
    return this.consumer.mintGuestPass(session, dto.guestName);
  }

  // Onboarding
  @Get("onboarding")
  @Capability("self.view")
  onboarding(@CurrentSession() session: Session) {
    return this.consumer.onboarding(session);
  }

  @Put("onboarding")
  @Capability("self.view")
  upsertOnboarding(@CurrentSession() session: Session, @Body() dto: UpsertOnboardingDto) {
    return this.consumer.upsertOnboarding(session, dto);
  }
}

// ── Product reviews (public read, gated write) ──────────────────────────
@Controller("products")
export class ReviewsController {
  constructor(private readonly consumer: ConsumerService) {}

  @Public()
  @Get(":id/reviews")
  reviews(@Param("id") id: string) {
    return this.consumer.productReviews(id);
  }

  // shop.buy (members) or self.view both grant write; we gate on self.view so any
  // signed-in member can leave a review for a product they own.
  @Post(":id/reviews")
  @Capability("self.view")
  addReview(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: CreateReviewDto) {
    return this.consumer.addReview(session, id, dto);
  }
}

// ── Store extras: packs, gift cards, promo, waivers ─────────────────────
@Controller()
export class StoreController {
  constructor(
    private readonly store: StoreService,
    private readonly consumer: ConsumerService,
    private readonly wallet: WalletService,
  ) {}

  // Packs
  @Public()
  @Get("packs")
  packs(@Req() req: OxRequest) {
    return this.store.packs(req.session);
  }

  @Post("packs/:id/buy")
  @Capability("shop.buy")
  buyPack(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.store.buyPack(session, id);
  }

  // Gift cards
  @Post("giftcards")
  @Capability("shop.buy")
  buyGiftCard(@CurrentSession() session: Session, @Body() dto: BuyGiftCardDto) {
    return this.store.buyGiftCard(session, dto);
  }

  @Post("giftcards/redeem")
  @Capability("shop.buy")
  redeemGiftCard(@CurrentSession() session: Session, @Body() dto: RedeemGiftCardDto) {
    return this.store.redeemGiftCard(session, dto);
  }

  // Promo
  @Post("cart/promo")
  @Capability("shop.buy")
  promo(@CurrentSession() session: Session, @Body() dto: PromoDto) {
    return this.store.promo(session, dto);
  }

  // Wallet / credits
  @Get("me/credits")
  @Capability("self.view")
  credits(@CurrentSession() session: Session) {
    return this.wallet.ledger(session);
  }

  // Waivers (floor templates)
  @Get("waivers")
  @Capability("self.view")
  waivers(@CurrentSession() session: Session) {
    return this.consumer.waivers(session);
  }

  @Post("waivers/:id/sign")
  @Capability("self.view")
  signWaiver(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.consumer.signWaiver(session, id);
  }
}

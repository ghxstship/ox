import { Module } from "@nestjs/common";
import { MeConsumerController, ReviewsController, StoreController } from "./consumer.controller";
import { ConsumerService } from "./consumer.service";
import { StoreService } from "./store.service";
import { WalletService } from "./wallet.service";

// Consumer-parity surfaces (11 §B consumer side): notifications, body metrics,
// wishlist, reviews, addresses, wallet/credits, packs, gift cards, promo,
// waivers, health, guest passes, onboarding. BillingService (global) is injected
// into StoreService for pack / gift-card PaymentIntents.
@Module({
  controllers: [MeConsumerController, ReviewsController, StoreController],
  providers: [ConsumerService, StoreService, WalletService],
  exports: [WalletService, StoreService],
})
export class ConsumerModule {}

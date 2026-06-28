import { Body, Controller, Delete, Get, Param, Post, Query, Req } from "@nestjs/common";
import { Capability, CurrentSession, Public } from "../common/decorators";
import type { OxRequest, Session } from "../common/session";
import { AddCartItemDto, CheckoutDto } from "./commerce.dto";
import { CommerceService } from "./commerce.service";

@Controller()
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}

  // Public, but personalizes gated drops when a session is attached.
  @Public()
  @Get("products")
  products(@Req() req: OxRequest, @Query("collection") collection?: string) {
    return this.commerce.products(req.session, collection);
  }

  @Get("cart")
  @Capability("shop.buy")
  cart(@CurrentSession() session: Session) {
    return this.commerce.cart(session);
  }

  @Post("cart/items")
  @Capability("shop.buy")
  addItem(@CurrentSession() session: Session, @Body() dto: AddCartItemDto) {
    return this.commerce.addItem(session, dto);
  }

  @Delete("cart/items/:id")
  @Capability("shop.buy")
  removeItem(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.commerce.removeItem(session, id);
  }

  @Post("checkout")
  @Capability("shop.buy")
  checkout(@CurrentSession() session: Session, @Body() dto: CheckoutDto) {
    return this.commerce.checkout(session, dto.promoCode);
  }
}

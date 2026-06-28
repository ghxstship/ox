import { Body, Controller, Delete, Get, Param, Post, Query, Req } from "@nestjs/common";
import { Capability, CurrentSession, CurrentToken, Public } from "../common/decorators";
import type { OxRequest, Session } from "../common/session";
import { AddCartItemDto, CheckoutDto } from "./commerce.dto";
import { CommerceService } from "./commerce.service";

@Controller()
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}

  // Public, but personalizes gated drops when a session is attached.
  @Public()
  @Get("products")
  products(@Req() req: OxRequest, @CurrentToken() token: string | undefined, @Query("collection") collection?: string) {
    return this.commerce.products(req.session, token, collection);
  }

  @Get("cart")
  @Capability("shop.buy")
  cart(@CurrentSession() session: Session, @CurrentToken() token: string | undefined) {
    return this.commerce.cart(session, token);
  }

  @Post("cart/items")
  @Capability("shop.buy")
  addItem(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: AddCartItemDto) {
    return this.commerce.addItem(session, token, dto);
  }

  @Delete("cart/items/:id")
  @Capability("shop.buy")
  removeItem(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.commerce.removeItem(session, token, id);
  }

  @Post("checkout")
  @Capability("shop.buy")
  checkout(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: CheckoutDto) {
    return this.commerce.checkout(session, token, dto.promoCode);
  }
}

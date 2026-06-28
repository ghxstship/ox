import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class AddCartItemDto {
  @IsString() productId!: string;
  @IsString() size!: string;
  @IsInt() @Min(1) @IsOptional() qty?: number;
}

export class CheckoutDto {
  /** Optional promo code applied to the order total at checkout. */
  @IsString() @IsOptional() promoCode?: string;
}

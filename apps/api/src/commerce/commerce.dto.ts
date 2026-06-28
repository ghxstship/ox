import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class AddCartItemDto {
  @IsString() productId!: string;
  @IsString() size!: string;
  @IsInt() @Min(1) @IsOptional() qty?: number;
}

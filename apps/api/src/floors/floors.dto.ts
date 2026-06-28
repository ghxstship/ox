import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateFloorDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() scenery?: string;
  @IsString() @IsOptional() stripeAccountId?: string;
  @IsOptional() geo?: { lat: number; lng: number };
}

export class EquipmentItemDto {
  @IsString() equipment!: string;
  @IsInt() @Min(1) @IsOptional() count?: number;
}

export class SetEquipmentDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => EquipmentItemDto) equipment!: EquipmentItemDto[];
}

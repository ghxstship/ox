import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class TicketTierDto {
  @IsString() name!: string;
  @IsInt() @Min(0) priceCents!: number;
  @IsInt() @Min(0) qty!: number;
}

export class CreateEventDto {
  @IsString() title!: string;
  @IsString() @IsOptional() floorId?: string;
  @IsString() hostName!: string;
  @IsDateString() startsAt!: string;
  @IsInt() @Min(0) @IsOptional() rewardXp?: number;
  @IsInt() @Min(0) @IsOptional() capacity?: number;
  @IsBoolean() @IsOptional() isRaid?: boolean;
  @IsArray() @ValidateNested({ each: true }) @Type(() => TicketTierDto) @IsOptional() tiers?: TicketTierDto[];
}

export class RsvpDto {
  @IsString() tierId!: string;
}

import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateLeadDto {
  @IsString() name!: string;
  @IsString() contact!: string;
  @IsString() @IsOptional() source?: string;
  @IsString() @IsOptional() floorId?: string;
  @IsInt() @Min(0) @IsOptional() valueCents?: number;
  @IsString() @IsOptional() notes?: string;
}

export class AdvanceLeadDto {
  @IsIn(["lead", "tour", "trial", "member", "lost"]) stage!: "lead" | "tour" | "trial" | "member" | "lost";
  @IsString() @IsOptional() note?: string;
}

export class CreateAutomationDto {
  @IsIn(["signup", "booking", "missed_class", "membership_lapsed"])
  trigger!: "signup" | "booking" | "missed_class" | "membership_lapsed";
  @IsString() action!: string;
  @IsInt() @Min(0) @IsOptional() delayHours?: number;
  @IsString() @IsOptional() floorId?: string;
}

export class ToggleAutomationDto {
  @IsOptional() enabled?: boolean;
}

export class PosItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) qty!: number;
}

export class PosSaleDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => PosItemDto) items!: PosItemDto[];
  @IsIn(["cash", "card"]) tender!: "cash" | "card";
  @IsString() @IsOptional() memberId?: string;
}

export class CreateShiftDto {
  @IsString() @IsOptional() staffId?: string;
  @IsString() startsAt!: string;
  @IsString() endsAt!: string;
  @IsIn(["class", "floor", "open"]) @IsOptional() kind?: "class" | "floor" | "open";
  @IsString() @IsOptional() floorId?: string;
}

export class CreateAgreementDto {
  @IsString() title!: string;
  @IsString() body!: string;
  @IsString() @IsOptional() floorId?: string;
}

export class SignAgreementDto {
  @IsString() dataUrl!: string;
}

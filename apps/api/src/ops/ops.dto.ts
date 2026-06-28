import { IsArray, IsIn, IsOptional, IsString } from "class-validator";

export class SubscribeDto {
  @IsString() userId!: string;
  @IsString() floorId!: string;
  @IsIn(["compass", "sound", "distant", "founder"]) tier!: "compass" | "sound" | "distant" | "founder";
  @IsString() @IsOptional() priceId?: string;
  @IsArray() @IsOptional() addOns?: string[];
}

export class UpdateMembershipDto {
  @IsIn(["pause", "resume", "cancel"]) action!: "pause" | "resume" | "cancel";
}

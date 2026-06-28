import { IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateClassDto {
  @IsString() title!: string;
  @IsString() floorId!: string;
  @IsString() @IsOptional() coachId?: string;
  @IsDateString() startsAt!: string;
  @IsInt() @Min(1) capacity!: number;
  @IsString() @IsOptional() load?: "open" | "fill" | "full";
  @IsString() @IsOptional() recurRule?: string;
}

export class UpdateClassDto {
  @IsString() @IsOptional() title?: string;
  @IsDateString() @IsOptional() startsAt?: string;
  @IsInt() @Min(1) @IsOptional() capacity?: number;
  @IsString() @IsOptional() load?: "open" | "fill" | "full";
  @IsString() @IsOptional() recurRule?: string;
}

export class CheckinDto {
  @IsString() userId!: string;
}

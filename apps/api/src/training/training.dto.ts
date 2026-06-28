import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import type { Equipment, Muscle } from "@ox/types";

export class GenerateWorkoutDto {
  @IsString() focus!: Muscle | string;
  @IsArray() @IsOptional() equipment?: Equipment[];
  @IsString() @IsOptional() experience?: "new" | "intermediate" | "advanced";
  @IsString() @IsOptional() goal?: string;
  @IsString() @IsOptional() floorId?: string;
}

export class StartWorkoutDto {
  @IsString() @IsOptional() floorId?: string;
  @IsString() @IsOptional() scenery?: string;
}

export class LogSetDto {
  @IsString() exerciseId!: string;
  @IsInt() @Min(0) index!: number;
  @IsNumber() @IsOptional() weight?: number;
  @IsInt() @Min(0) reps!: number;
  @IsInt() @Min(6) @Max(10) @IsOptional() rpe?: number;
  @IsBoolean() @IsOptional() done?: boolean;
}

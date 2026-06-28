import { IsOptional, IsString, ValidateIf } from "class-validator";

export class OtpStartDto {
  @ValidateIf((o: OtpStartDto) => !o.phone)
  @IsString()
  @IsOptional()
  email?: string;

  @ValidateIf((o: OtpStartDto) => !o.email)
  @IsString()
  @IsOptional()
  phone?: string;
}

export class OtpVerifyDto {
  @IsString()
  id!: string;

  @IsString()
  code!: string;
}

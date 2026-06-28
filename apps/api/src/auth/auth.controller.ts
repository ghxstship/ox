import { Body, Controller, HttpCode, Post, Req } from "@nestjs/common";
import { Public } from "../common/decorators";
import type { OxRequest } from "../common/session";
import { OtpStartDto, OtpVerifyDto } from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("otp/start")
  @HttpCode(200)
  start(@Body() body: OtpStartDto): { id: string } {
    return this.auth.start(body.email ?? body.phone ?? "");
  }

  @Public()
  @Post("otp/verify")
  @HttpCode(200)
  verify(@Body() body: OtpVerifyDto) {
    return this.auth.verify(body.id, body.code);
  }

  // Public route, but it reads the bearer to revoke it. The guard attaches
  // req.accessToken even on @Public() routes when a token is present.
  @Public()
  @Post("signout")
  @HttpCode(204)
  signout(@Req() req: OxRequest): void {
    this.auth.signout(req.accessToken);
  }
}

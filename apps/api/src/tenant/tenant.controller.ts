import { Controller, Get, Headers } from "@nestjs/common";
import type { BrandConfig } from "@ox/types";
import { Public } from "../common/decorators";
import { TenantService } from "./tenant.service";

@Controller("tenant")
export class TenantController {
  constructor(private readonly tenant: TenantService) {}

  @Public()
  @Get("brand")
  brand(@Headers("x-ox-brand") brand?: string): BrandConfig {
    return this.tenant.brand(brand);
  }
}

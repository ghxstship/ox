import { Global, Module } from "@nestjs/common";
import { SupaService } from "./supa.service";
import { SupabaseBridge } from "./supabase.bridge";
import { TokenDenylist } from "./token-denylist";

@Global()
@Module({
  providers: [SupaService, SupabaseBridge, TokenDenylist],
  exports: [SupaService, SupabaseBridge, TokenDenylist],
})
export class CommonModule {}

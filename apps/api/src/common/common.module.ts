import { Global, Module } from "@nestjs/common";
import { ScopeRunner } from "./scope.runner";
import { SupabaseBridge } from "./supabase.bridge";
import { TokenDenylist } from "./token-denylist";

@Global()
@Module({
  providers: [ScopeRunner, SupabaseBridge, TokenDenylist],
  exports: [ScopeRunner, SupabaseBridge, TokenDenylist],
})
export class CommonModule {}

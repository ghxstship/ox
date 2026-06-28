import { Global, Module } from "@nestjs/common";
import { ScopeRunner } from "./scope.runner";

@Global()
@Module({
  providers: [ScopeRunner],
  exports: [ScopeRunner],
})
export class CommonModule {}

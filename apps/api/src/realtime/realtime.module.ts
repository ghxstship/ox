import { Global, Module } from "@nestjs/common";
import { RealtimeBus } from "./realtime.bus";
import { RealtimeController } from "./realtime.controller";

// Global so any service can inject RealtimeBus to publish events.
@Global()
@Module({
  controllers: [RealtimeController],
  providers: [RealtimeBus],
  exports: [RealtimeBus],
})
export class RealtimeModule {}

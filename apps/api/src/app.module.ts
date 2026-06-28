import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { CapabilityGuard } from "./auth/capability.guard";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { BillingModule } from "./billing/billing.module";
import { ClassesModule } from "./classes/classes.module";
import { CommerceModule } from "./commerce/commerce.module";
import { CommonModule } from "./common/common.module";
import { ConsumerModule } from "./consumer/consumer.module";
import { ErrorFilter } from "./common/error.filter";
import { EventsModule } from "./events/events.module";
import { FloorsModule } from "./floors/floors.module";
import { MeModule } from "./me/me.module";
import { OpsModule } from "./ops/ops.module";
import { ParityModule } from "./parity/parity.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { TenantModule } from "./tenant/tenant.module";
import { TrainingModule } from "./training/training.module";
import { WebhooksModule } from "./webhooks/webhooks.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    RealtimeModule,
    ParityModule,
    BillingModule,
    AuthModule,
    MeModule,
    TenantModule,
    FloorsModule,
    TrainingModule,
    ClassesModule,
    EventsModule,
    CommerceModule,
    ConsumerModule,
    OpsModule,
    AdminModule,
    WebhooksModule,
  ],
  providers: [
    // Order matters: authenticate first (attach session), then check capability.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CapabilityGuard },
    { provide: APP_FILTER, useClass: ErrorFilter },
  ],
})
export class AppModule {}

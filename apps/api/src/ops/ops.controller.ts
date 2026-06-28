import { Controller, Get, Param, Post } from "@nestjs/common";
import { Capability, CurrentSession } from "../common/decorators";
import type { Session } from "../common/session";
import { OpsService } from "./ops.service";

@Controller()
export class OpsController {
  constructor(private readonly ops: OpsService) {}

  @Get("members")
  @Capability("members.view")
  members(@CurrentSession() session: Session) {
    return this.ops.members(session);
  }

  @Get("members/:id")
  @Capability("members.view")
  member(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.ops.member(session, id);
  }

  @Get("clients")
  @Capability("clients.view")
  clients(@CurrentSession() session: Session) {
    return this.ops.clients(session);
  }

  @Get("payments")
  @Capability("revenue.view")
  payments(@CurrentSession() session: Session) {
    return this.ops.payments(session);
  }

  @Post("payments/:id/retry")
  @Capability("revenue.view")
  retry(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.ops.retryPayment(session, id);
  }

  @Get("memberships")
  @Capability("revenue.view")
  memberships(@CurrentSession() session: Session) {
    return this.ops.memberships(session);
  }

  @Get("reports/:name")
  @Capability("revenue.view")
  report(@CurrentSession() session: Session, @Param("name") name: string) {
    return this.ops.report(session, name);
  }
}

import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Capability, CurrentSession } from "../common/decorators";
import type { Session } from "../common/session";
import { SubscribeDto, UpdateMembershipDto } from "./ops.dto";
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

  @Post("memberships")
  @Capability("revenue.view")
  subscribe(@CurrentSession() session: Session, @Body() dto: SubscribeDto) {
    return this.ops.subscribe(session, dto);
  }

  @Patch("memberships/:id")
  @Capability("revenue.view")
  updateMembership(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: UpdateMembershipDto) {
    return this.ops.updateMembership(session, id, dto.action);
  }

  @Get("reports/:name")
  @Capability("revenue.view")
  report(@CurrentSession() session: Session, @Param("name") name: string) {
    return this.ops.report(session, name);
  }
}

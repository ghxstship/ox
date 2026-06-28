import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Capability, CurrentSession, CurrentToken } from "../common/decorators";
import type { Session } from "../common/session";
import { SubscribeDto, UpdateMembershipDto } from "./ops.dto";
import { OpsService } from "./ops.service";

@Controller()
export class OpsController {
  constructor(private readonly ops: OpsService) {}

  @Get("members")
  @Capability("members.view")
  members(@CurrentSession() session: Session, @CurrentToken() token: string | undefined) {
    return this.ops.members(session, token);
  }

  @Get("members/:id")
  @Capability("members.view")
  member(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.ops.member(session, token, id);
  }

  @Get("clients")
  @Capability("clients.view")
  clients(@CurrentSession() session: Session, @CurrentToken() token: string | undefined) {
    return this.ops.clients(session, token);
  }

  @Get("payments")
  @Capability("revenue.view")
  payments(@CurrentSession() session: Session, @CurrentToken() token: string | undefined) {
    return this.ops.payments(session, token);
  }

  @Post("payments/:id/retry")
  @Capability("revenue.view")
  retry(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.ops.retryPayment(session, token, id);
  }

  @Get("memberships")
  @Capability("revenue.view")
  memberships(@CurrentSession() session: Session, @CurrentToken() token: string | undefined) {
    return this.ops.memberships(session, token);
  }

  @Post("memberships")
  @Capability("revenue.view")
  subscribe(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: SubscribeDto) {
    return this.ops.subscribe(session, token, dto);
  }

  @Patch("memberships/:id")
  @Capability("revenue.view")
  updateMembership(
    @CurrentSession() session: Session,
    @CurrentToken() token: string | undefined,
    @Param("id") id: string,
    @Body() dto: UpdateMembershipDto,
  ) {
    return this.ops.updateMembership(session, token, id, dto.action);
  }

  @Get("reports/:name")
  @Capability("revenue.view")
  report(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("name") name: string) {
    return this.ops.report(session, token, name);
  }
}

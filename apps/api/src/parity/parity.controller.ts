// Operator parity surfaces (11 §B): lead pipeline, automation builder, POS,
// staff scheduling, commission/payroll, contracts/e-sign. Every route is
// capability-gated; floor scope is enforced inside each service (a host only ever
// touches their own floor; admin is global). Routes that compute over the live
// ledger (POS, payroll) read as the caller so RLS applies.
import { Body, Controller, Get, Header, Param, Post, Query } from "@nestjs/common";
import { Capability, CurrentSession, CurrentToken } from "../common/decorators";
import type { Session } from "../common/session";
import { AutomationsService } from "./automations.service";
import { ContractsService } from "./contracts.service";
import {
  AdvanceLeadDto,
  CreateAgreementDto,
  CreateAutomationDto,
  CreateLeadDto,
  CreateShiftDto,
  PosSaleDto,
  SignAgreementDto,
  ToggleAutomationDto,
} from "./parity.dto";
import { LeadsService, type LeadStage } from "./leads.service";
import { PayrollService } from "./payroll.service";
import { PosService } from "./pos.service";
import { StaffService } from "./staff.service";

@Controller()
export class ParityController {
  constructor(
    private readonly leads: LeadsService,
    private readonly automations: AutomationsService,
    private readonly pos: PosService,
    private readonly staff: StaffService,
    private readonly payroll: PayrollService,
    private readonly contracts: ContractsService,
  ) {}

  // ── Lead / Prospect Pipeline (host, admin) ────────────────────────
  @Get("leads")
  @Capability("members.view")
  listLeads(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Query("stage") stage?: LeadStage) {
    return this.leads.list(session, token, stage);
  }

  @Post("leads")
  @Capability("members.view")
  createLead(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: CreateLeadDto) {
    return this.leads.create(session, token, dto);
  }

  @Post("leads/:id/stage")
  @Capability("members.view")
  advanceLead(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string, @Body() dto: AdvanceLeadDto) {
    return this.leads.advance(session, token, id, dto.stage, dto.note);
  }

  @Post("leads/:id/convert")
  @Capability("members.view")
  convertLead(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.leads.convert(session, token, id);
  }

  // ── Automation Builder (host, admin) ──────────────────────────────
  @Get("automations")
  @Capability("members.view")
  listAutomations(@CurrentSession() session: Session, @CurrentToken() token: string | undefined) {
    return this.automations.list(session, token);
  }

  @Post("automations")
  @Capability("members.view")
  createAutomation(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: CreateAutomationDto) {
    return this.automations.create(session, token, dto);
  }

  @Post("automations/:id/toggle")
  @Capability("members.view")
  toggleAutomation(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string, @Body() dto: ToggleAutomationDto) {
    return this.automations.toggle(session, token, id, dto.enabled);
  }

  // ── POS · Desk Sales (host) ───────────────────────────────────────
  @Get("pos/catalog")
  @Capability("revenue.view")
  posCatalog() {
    return this.pos.catalog();
  }

  @Post("pos/sales")
  @Capability("revenue.view")
  posSale(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: PosSaleDto) {
    return this.pos.sale(session, token, dto);
  }

  // ── Staff Scheduling / Shifts (coach, host) ───────────────────────
  @Get("staff/shifts")
  @Capability("roster.view")
  listShifts(@CurrentSession() session: Session, @CurrentToken() token: string | undefined) {
    return this.staff.list(session, token);
  }

  @Post("staff/shifts")
  @Capability("roster.view")
  createShift(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: CreateShiftDto) {
    return this.staff.create(session, token, dto);
  }

  @Post("staff/shifts/:id/cover")
  @Capability("roster.view")
  requestCover(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string) {
    return this.staff.requestCover(session, token, id);
  }

  // ── Commission / Payroll (admin) ──────────────────────────────────
  @Get("payroll")
  @Capability("revenue.view")
  payrollRows(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Query("period") period?: string) {
    return this.payroll.commissions(session, token, period);
  }

  @Get("payroll/export")
  @Capability("revenue.view")
  @Header("content-type", "text/csv")
  payrollCsv(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Query("period") period?: string) {
    return this.payroll.csv(session, token, period);
  }

  // ── Contracts / Waivers + e-sign (host, admin) ────────────────────
  @Get("contracts")
  @Capability("members.view")
  listContracts(@CurrentSession() session: Session, @CurrentToken() token: string | undefined) {
    return this.contracts.list(session, token);
  }

  @Post("contracts")
  @Capability("members.view")
  createContract(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Body() dto: CreateAgreementDto) {
    return this.contracts.create(session, token, dto);
  }

  @Get("contracts/archive")
  @Capability("self.view")
  contractArchive(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Query("agreementId") agreementId?: string) {
    return this.contracts.archive(session, token, agreementId);
  }

  // Members sign agreements presented to them; self.view is the floor for it.
  @Post("contracts/:id/sign")
  @Capability("self.view")
  signContract(@CurrentSession() session: Session, @CurrentToken() token: string | undefined, @Param("id") id: string, @Body() dto: SignAgreementDto) {
    return this.contracts.sign(session, token, id, dto.dataUrl);
  }
}

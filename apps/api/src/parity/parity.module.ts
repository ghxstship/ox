import { Global, Module } from "@nestjs/common";
import { AutomationsService } from "./automations.service";
import { ContractsService } from "./contracts.service";
import { LeadsService } from "./leads.service";
import { ParityController } from "./parity.controller";
import { PayrollService } from "./payroll.service";
import { PosService } from "./pos.service";
import { StaffService } from "./staff.service";

// Operator-parity surfaces (11 §B). Global so AutomationsService (the trigger
// runner) can be injected into classes/auth to fire on signup/booking.
@Global()
@Module({
  controllers: [ParityController],
  providers: [LeadsService, AutomationsService, PosService, StaffService, PayrollService, ContractsService],
  exports: [AutomationsService],
})
export class ParityModule {}

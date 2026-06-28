// Floors — public discovery (the matchmaking source). Reads are public (Floor is
// public read in the RLS model). Writes are operator-gated:
//   PUT  /floors/:id            floor.manage      (host edits their floor)
//   PUT  /floors/:id/equipment  equipment.manage  (host sets the equipment roster)
import { Body, Controller, Get, NotFoundException, Param, Put } from "@nestjs/common";
import { prisma } from "@ox/db";
import { Capability, CurrentSession, Public } from "../common/decorators";
import type { Session } from "../common/session";
import { SetEquipmentDto, UpdateFloorDto } from "./floors.dto";
import { FloorsService } from "./floors.service";

@Controller("floors")
export class FloorsController {
  constructor(private readonly floors: FloorsService) {}

  @Public()
  @Get()
  list() {
    return prisma.floor.findMany({ include: { equipment: true }, orderBy: { name: "asc" } });
  }

  @Public()
  @Get(":id")
  async get(@Param("id") id: string) {
    const floor = await prisma.floor.findUnique({ where: { id }, include: { equipment: true } });
    if (!floor) throw new NotFoundException({ code: "not_found", message: "No floor." });
    return floor;
  }

  @Put(":id")
  @Capability("floor.manage")
  update(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: UpdateFloorDto) {
    return this.floors.update(session, id, dto);
  }

  @Put(":id/equipment")
  @Capability("equipment.manage")
  setEquipment(@CurrentSession() session: Session, @Param("id") id: string, @Body() dto: SetEquipmentDto) {
    return this.floors.setEquipment(session, id, dto);
  }
}

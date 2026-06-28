// Floors — public discovery (the matchmaking source). Read directly; Floor is
// public read in the RLS model.
import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { prisma } from "@ox/db";
import { Public } from "../common/decorators";

@Controller("floors")
export class FloorsController {
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
}

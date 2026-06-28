// Floor management writes (03 · operator/CRM). Reads are public; updates require
// floor.manage and equipment changes require equipment.manage. All writes run
// through ScopeRunner so RLS keeps a host to their own floor.
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";
import type { UpdateFloorDto, SetEquipmentDto } from "./floors.dto";

@Injectable()
export class FloorsService {
  constructor(private readonly scope: ScopeRunner) {}

  update(session: Session, id: string, dto: UpdateFloorDto) {
    return this.scope.run(session, async (tx) => {
      const floor = await tx.floor.findUnique({ where: { id } });
      if (!floor) throw new NotFoundException({ code: "not_found", message: "No floor (or out of scope)." });
      return tx.floor.update({
        where: { id },
        data: {
          name: dto.name,
          address: dto.address,
          scenery: dto.scenery as Prisma.FloorUpdateInput["scenery"],
          stripeAccountId: dto.stripeAccountId,
          geo: dto.geo as Prisma.InputJsonValue | undefined,
        },
      });
    });
  }

  /** Replace the floor's equipment roster with the supplied set. */
  setEquipment(session: Session, id: string, dto: SetEquipmentDto) {
    return this.scope.run(session, async (tx) => {
      const floor = await tx.floor.findUnique({ where: { id } });
      if (!floor) throw new NotFoundException({ code: "not_found", message: "No floor (or out of scope)." });
      await tx.floorEquipment.deleteMany({ where: { floorId: id } });
      for (const item of dto.equipment) {
        await tx.floorEquipment.create({
          data: {
            floorId: id,
            equipment: item.equipment as Prisma.FloorEquipmentCreateInput["equipment"],
            count: item.count ?? 1,
          },
        });
      }
      return tx.floorEquipment.findMany({ where: { floorId: id } });
    });
  }
}

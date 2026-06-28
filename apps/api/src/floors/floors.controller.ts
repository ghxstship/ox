// Floors — public discovery (the matchmaking source). Reads are public (Floor is
// public read in the RLS model). Writes are operator-gated:
//   PUT  /floors/:id            floor.manage      (host edits their floor)
//   PUT  /floors/:id/equipment  equipment.manage  (host sets the equipment roster)
import { Body, Controller, Get, NotFoundException, Param, Put } from "@nestjs/common";
import { Capability, CurrentSession, CurrentToken, Public } from "../common/decorators";
import type { Session } from "../common/session";
import { SupaService } from "../common/supa.service";
import { SetEquipmentDto, UpdateFloorDto } from "./floors.dto";
import { FloorsService } from "./floors.service";

@Controller("floors")
export class FloorsController {
  constructor(
    private readonly floors: FloorsService,
    private readonly supa: SupaService,
  ) {}

  @Public()
  @Get()
  async list() {
    const sb = this.supa.forUser();
    const { data: floors, error } = await sb.from("Floor").select("*").order("name", { ascending: true });
    if (error) throw new NotFoundException({ code: "not_found", message: error.message });
    return Promise.all(
      (floors ?? []).map(async (floor) => {
        const { data: equipment } = await sb.from("FloorEquipment").select("*").eq("floorId", floor.id);
        return { ...floor, equipment: equipment ?? [] };
      }),
    );
  }

  @Public()
  @Get(":id")
  async get(@Param("id") id: string) {
    const sb = this.supa.forUser();
    const { data: floor, error } = await sb.from("Floor").select("*").eq("id", id).maybeSingle();
    if (error) throw new NotFoundException({ code: "not_found", message: error.message });
    if (!floor) throw new NotFoundException({ code: "not_found", message: "No floor." });
    const { data: equipment } = await sb.from("FloorEquipment").select("*").eq("floorId", id);
    return { ...floor, equipment: equipment ?? [] };
  }

  @Put(":id")
  @Capability("floor.manage")
  update(
    @CurrentSession() session: Session,
    @CurrentToken() token: string | undefined,
    @Param("id") id: string,
    @Body() dto: UpdateFloorDto,
  ) {
    return this.floors.update(session, token, id, dto);
  }

  @Put(":id/equipment")
  @Capability("equipment.manage")
  setEquipment(
    @CurrentSession() session: Session,
    @CurrentToken() token: string | undefined,
    @Param("id") id: string,
    @Body() dto: SetEquipmentDto,
  ) {
    return this.floors.setEquipment(session, token, id, dto);
  }
}

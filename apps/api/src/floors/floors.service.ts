// Floor management writes (03 · operator/CRM). Reads are public; updates require
// floor.manage and equipment changes require equipment.manage. All writes run AS
// the caller (RLS) via supa.forUser(token) so a host stays on their own floor.
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import type { Enums, TablesUpdate } from "@ox/supabase/types";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";
import type { UpdateFloorDto, SetEquipmentDto } from "./floors.dto";

@Injectable()
export class FloorsService {
  constructor(private readonly supa: SupaService) {}

  async update(session: Session, token: string | undefined, id: string, dto: UpdateFloorDto) {
    const sb = this.supa.forUser(token);
    const { data: floor } = await sb.from("Floor").select("id").eq("id", id).maybeSingle();
    if (!floor) throw new NotFoundException({ code: "not_found", message: "No floor (or out of scope)." });

    const patch: TablesUpdate<"Floor"> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.address !== undefined) patch.address = dto.address;
    if (dto.scenery !== undefined) patch.scenery = dto.scenery as Enums<"Scenery">;
    if (dto.stripeAccountId !== undefined) patch.stripeAccountId = dto.stripeAccountId;
    if (dto.geo !== undefined) patch.geo = dto.geo as TablesUpdate<"Floor">["geo"];

    const { data, error } = await sb.from("Floor").update(patch).eq("id", id).select().single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  /** Replace the floor's equipment roster with the supplied set. */
  async setEquipment(session: Session, token: string | undefined, id: string, dto: SetEquipmentDto) {
    const sb = this.supa.forUser(token);
    const { data: floor } = await sb.from("Floor").select("id").eq("id", id).maybeSingle();
    if (!floor) throw new NotFoundException({ code: "not_found", message: "No floor (or out of scope)." });

    const { error: delErr } = await sb.from("FloorEquipment").delete().eq("floorId", id);
    if (delErr) throw new InternalServerErrorException({ code: "internal", message: delErr.message });

    if (dto.equipment.length) {
      const rows = dto.equipment.map((item) => ({
        floorId: id,
        equipment: item.equipment as Enums<"Equipment">,
        count: item.count ?? 1,
      }));
      const { error: insErr } = await sb.from("FloorEquipment").insert(rows);
      if (insErr) throw new InternalServerErrorException({ code: "internal", message: insErr.message });
    }

    const { data, error } = await sb.from("FloorEquipment").select("*").eq("floorId", id);
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }
}

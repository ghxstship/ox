// Map — floor discovery. List floors with scenery + an equipment readout per
// floor (FloorEquipment). Public discovery via Supabase. Tap a floor to expand
// its equipment match.
import { useState } from "react";
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Row, Chip, Skeleton, EmptyState, RuleLine } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { useFloors } from "../../src/data";
import { supabase, type FloorEquipmentRow } from "../../src/supabase";
import { useAsync } from "../../src/data";
import { num } from "@ox/rbac";

export default function MapScreen() {
  const floors = useFloors();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ScreenScroll>
      <Label>Find your floor.</Label>
      <Display>Map</Display>

      {floors.loading ? (
        <Skeleton height={160} />
      ) : floors.data.length === 0 ? (
        <EmptyState title="No floors" />
      ) : (
        floors.data.map((f) => (
          <Card key={f.id}>
            <Row style={{ justifyContent: "space-between" }} onTouchEnd={() => setOpen(open === f.id ? null : f.id)}>
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: "600" }}>{f.name}</Body>
                <Label>{f.scenery}</Label>
                {f.address ? <Body style={{ color: color.stone }}>{f.address}</Body> : null}
              </View>
              <Chip label={open === f.id ? "Hide" : "Equipment"} active={open === f.id} onPress={() => setOpen(open === f.id ? null : f.id)} />
            </Row>
            {open === f.id ? <Equipment floorId={f.id} /> : null}
          </Card>
        ))
      )}
    </ScreenScroll>
  );
}

function Equipment({ floorId }: { floorId: string }) {
  const { data, loading } = useAsync<FloorEquipmentRow[]>(
    async () => {
      const { data, error } = await supabase.from("FloorEquipment").select("*").eq("floorId", floorId);
      if (error) throw error;
      return data ?? [];
    },
    [],
    [floorId]
  );
  return (
    <View style={{ marginTop: space.sm }}>
      <RuleLine style={{ marginBottom: space.sm }} />
      <Label>Equipment match</Label>
      {loading ? (
        <Skeleton height={32} />
      ) : data.length === 0 ? (
        <Body style={{ color: color.stone }}>No inventory listed.</Body>
      ) : (
        <Row style={{ flexWrap: "wrap", marginTop: space.xs }}>
          {data.map((e) => (
            <Chip key={e.id} label={`${e.equipment} ×${num(e.count)}`} />
          ))}
        </Row>
      )}
    </View>
  );
}

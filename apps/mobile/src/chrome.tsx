// OX mobile — signed-in chrome bits: the RLS scope chip + a header row with
// identity. scopeLabel() from @ox/rbac gives the human-readable scope.
import { View } from "react-native";
import { scopeLabel } from "@ox/rbac";
import { Row, Avatar, Label, Body } from "./ui";
import { color, space } from "./tokens";
import { useSession } from "./session";
import { useFloors } from "./data";

export function ScopeChip() {
  const { session } = useSession();
  const { data: floors } = useFloors();
  const label = scopeLabel(session, (id) => floors.find((f) => f.id === id)?.name);
  return (
    <View style={{ alignSelf: "flex-start", borderWidth: 1, borderColor: color.stone, paddingHorizontal: space.sm, paddingVertical: 3 }}>
      <Label>{label}</Label>
    </View>
  );
}

export function IdentityHeader() {
  const { session } = useSession();
  if (!session) return null;
  return (
    <Row>
      <Avatar initial={session.initial} />
      <View style={{ flex: 1 }}>
        <Body style={{ fontWeight: "600" }}>{session.name}</Body>
        <ScopeChip />
      </View>
    </Row>
  );
}

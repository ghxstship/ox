import { ScrollView } from "react-native";
import { Screen, Card, Label, Display, Body } from "../src/ui";

export default function Tribe() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Screen>
        <Label>Feed · Leaderboard · Classes</Label>
        <Display>Tribe</Display>
        <Card>
          <Body>Mara hit a new squat PR. Herd that.</Body>
        </Card>
      </Screen>
    </ScrollView>
  );
}

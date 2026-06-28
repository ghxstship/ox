import { ScrollView } from "react-native";
import { Screen, Card, Label, Display, Body } from "../src/ui";

export default function Train() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Screen>
        <Label>Library · Generator · Player</Label>
        <Display>Train</Display>
        <Card>
          <Body>Back Squat 205x3 @ RPE 9. The herd showed up.</Body>
        </Card>
      </Screen>
    </ScrollView>
  );
}

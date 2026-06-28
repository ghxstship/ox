import { ScrollView } from "react-native";
import { Screen, Card, Label, Display, Body } from "../src/ui";

export default function You() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Screen>
        <Label>Credential · PRs · Recovery</Label>
        <Display>You</Display>
        <Card>
          <Body>OX-04471 · Compass · Active. Renews Dec 2026.</Body>
        </Card>
      </Screen>
    </ScrollView>
  );
}

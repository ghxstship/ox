import { ScrollView } from "react-native";
import { Screen, Card, Label, Display, Body } from "../src/ui";

export default function Map() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Screen>
        <Label>Floors near you</Label>
        <Display>Map</Display>
        <Card>
          <Body>Pier 9 Iron — oceanfront. Barbell, kettlebell, TRX. Plug in.</Body>
        </Card>
      </Screen>
    </ScrollView>
  );
}

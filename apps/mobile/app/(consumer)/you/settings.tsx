// Settings — locale / units / currency. These drive the i18n helpers app-wide
// (money/weight/distance/date), persisted to AsyncStorage via the session prefs.
import { ScreenScroll, Card, Label, Display, Body, SegControl, Field } from "../../../src/ui";
import { space } from "../../../src/tokens";
import { usePrefs, useSession } from "../../../src/session";
import { money, weight, distance } from "@ox/rbac";

export default function Settings() {
  const prefs = usePrefs();
  const { setPrefs } = useSession();

  return (
    <ScreenScroll>
      <Label>Your preferences.</Label>
      <Display>Settings</Display>

      <Card style={{ gap: space.sm }}>
        <Label>Units</Label>
        <SegControl
          options={[
            { value: "lb", label: "Imperial (lb)" },
            { value: "kg", label: "Metric (kg)" },
          ]}
          value={prefs.units}
          onChange={(v) => setPrefs({ units: v as "kg" | "lb" })}
        />
        <Label>Currency</Label>
        <SegControl
          options={[
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
          ]}
          value={prefs.currency}
          onChange={(v) => setPrefs({ currency: v })}
        />
        <Field
          label="Locale"
          value={prefs.locale}
          onChangeText={(v) => setPrefs({ locale: v })}
          autoCapitalize="none"
          placeholder="en-US"
        />
      </Card>

      <Card style={{ gap: space.xs }}>
        <Label>Preview</Label>
        <Body>Price: {money(240, { locale: prefs.locale, currency: prefs.currency })}</Body>
        <Body>Lift: {weight(225, prefs.units, { locale: prefs.locale })}</Body>
        <Body>Run: {distance(5000, prefs.units, { locale: prefs.locale })}</Body>
      </Card>
    </ScreenScroll>
  );
}

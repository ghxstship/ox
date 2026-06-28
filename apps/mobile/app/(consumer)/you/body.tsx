// Body Metrics — log weight / waist / bodyfat, see history. GET/POST /me/body
// (parity §D) called by path until typed. States: empty · entry · history.
import { useState } from "react";
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Field, SegControl, Banner, RuleLine } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { api, tryApi } from "../../../src/api";
import { useSession } from "../../../src/session";
import { useAsync } from "../../../src/data";
import { num, date, weight as fmtWeight } from "@ox/rbac";

interface Metric { id: string; kind: string; value: number; unit: string; at: string }

export default function BodyMetrics() {
  const { prefs } = useSession();
  const { data: metrics, loading, reload } = useAsync<Metric[]>(
    async () => tryApi(() => api.http.get<Metric[]>("/me/body"), []),
    []
  );
  const [kind, setKind] = useState("weight");
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function log() {
    if (!value) return;
    setMsg(null);
    try {
      // POST /me/body {kind,value,unit}
      await api.http.post("/me/body", { kind, value: Number(value), unit: kind === "weight" ? prefs.units : kind === "waist" ? "in" : "%" });
      setMsg("Logged.");
      setValue("");
      reload();
    } catch {
      setMsg("Couldn't save.");
    }
  }

  return (
    <ScreenScroll>
      <Label>Track the trend.</Label>
      <Display>Body</Display>
      {msg ? <Banner message={msg} /> : null}

      <Card style={{ gap: space.sm }}>
        <Label>Log a metric</Label>
        <SegControl
          options={[
            { value: "weight", label: "Weight" },
            { value: "waist", label: "Waist" },
            { value: "bodyfat", label: "Body fat" },
          ]}
          value={kind}
          onChange={setKind}
        />
        <Field label="Value" keyboardType="numeric" value={value} onChangeText={setValue} />
        <Button title="Log" variant="primary" onPress={log} disabled={!value} />
      </Card>

      <Card>
        <Label>History</Label>
        {loading ? null : metrics.length === 0 ? (
          <Body style={{ color: color.stone }}>No entries yet.</Body>
        ) : (
          metrics.map((m, i) => (
            <View key={m.id}>
              {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
              <Row style={{ justifyContent: "space-between" }}>
                <Body>{m.kind}</Body>
                <Label>
                  {m.kind === "weight" ? fmtWeight(m.value, prefs.units, { locale: prefs.locale }) : `${num(m.value)} ${m.unit}`} · {date(m.at, { locale: prefs.locale })}
                </Label>
              </Row>
            </View>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}

// OX mobile — sign-in gate. Two paths:
//   • one-tap demo identities (Mara/Dom/Iris/HQ) — real OX JWT via otpVerify
//   • email OTP via Supabase (signInWithOtp → verifyOtp)
// Routing after sign-in is handled by the root Gate (NAV[role].app).
import { useState } from "react";
import { Pressable, View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Button, Field, Avatar, Row, Banner, RuleLine } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { DEMO_IDENTITIES, useSession } from "../../src/session";

export default function SignIn() {
  const { signInDemo, startEmailOtp, verifyEmailOtp } = useSession();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function tap(id: string) {
    setErr(null);
    setBusy(true);
    try {
      await signInDemo(id);
    } catch (e: any) {
      setErr(e?.message ?? "Sign-in failed. Is the API running?");
    } finally {
      setBusy(false);
    }
  }

  async function sendCode() {
    setErr(null);
    setBusy(true);
    try {
      await startEmailOtp(email.trim());
      setStage("code");
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't send code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setErr(null);
    setBusy(true);
    try {
      await verifyEmailOtp(email.trim(), code.trim());
    } catch (e: any) {
      setErr(e?.message ?? "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenScroll>
      <Label>Plug in. Level up.</Label>
      <Display>OX</Display>
      <Body style={{ color: color.stone }}>One herd. Pick an identity or use your email.</Body>

      {err ? <Banner tone="danger" message={err} /> : null}

      <Card style={{ gap: space.sm }}>
        <Label>Demo identities</Label>
        {DEMO_IDENTITIES.map((d, i) => (
          <View key={d.id}>
            {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
            <Pressable onPress={() => tap(d.id)} disabled={busy} style={{ opacity: busy ? 0.5 : 1 }}>
              <Row>
                <Avatar initial={d.name.slice(0, 1)} />
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: "600" }}>{d.name}</Body>
                  <Label>{d.line}</Label>
                </View>
                <Label>Tap</Label>
              </Row>
            </Pressable>
          </View>
        ))}
      </Card>

      <Card style={{ gap: space.sm }}>
        <Label>Email one-time code</Label>
        {stage === "email" ? (
          <>
            <Field
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@ox.fit"
            />
            <Button title={busy ? "Sending…" : "Send code"} variant="primary" disabled={busy || !email} onPress={sendCode} />
          </>
        ) : (
          <>
            <Body style={{ color: color.stone }}>Code sent to {email}.</Body>
            <Field label="Code" keyboardType="number-pad" value={code} onChangeText={setCode} placeholder="000000" />
            <Button title={busy ? "Verifying…" : "Verify"} variant="primary" disabled={busy || !code} onPress={verify} />
            <Button title="Use a different email" variant="ghost" onPress={() => setStage("email")} />
          </>
        )}
      </Card>
    </ScreenScroll>
  );
}

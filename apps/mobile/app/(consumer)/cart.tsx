// Cart / Checkout v2 — line items, promo code, shipping select, checkout.
// Reads /cart; checkout via /checkout. States: empty · items · placed · error.
import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Field, Banner, SegControl, EmptyState, RuleLine } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { api, tryApi } from "../../src/api";
import { useSession } from "../../src/session";
import { useAsync } from "../../src/data";
import { moneyFromCents } from "@ox/rbac";
import type { Order } from "@ox/types";

export default function Cart() {
  const router = useRouter();
  const { prefs } = useSession();
  const { data: cart, loading, reload } = useAsync<Order | null>(
    async () => tryApi(() => api.shop.cart(), null),
    null
  );
  const [promo, setPromo] = useState("");
  const [shipping, setShipping] = useState("standard");
  const [msg, setMsg] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [busy, setBusy] = useState(false);

  async function applyPromo() {
    setMsg(null);
    try {
      // Endpoint POST /cart/promo {code} (parity §D) — call by path until typed.
      await api.http.post("/cart/promo", { code: promo });
      setMsg("Promo applied.");
      reload();
    } catch {
      setMsg("Invalid code.");
    }
  }

  async function checkout() {
    setBusy(true);
    setMsg(null);
    try {
      await api.shop.checkout({ shipping });
      setPlaced(true);
    } catch (e: any) {
      setMsg(e?.message ?? "Payment error — items kept.");
    } finally {
      setBusy(false);
    }
  }

  if (placed) {
    return (
      <ScreenScroll>
        <Label>Order placed.</Label>
        <Display>Confirmed</Display>
        <Body>Tracking lands in You ▸ Orders. Herd that.</Body>
        <Button title="Keep shopping" variant="primary" onPress={() => router.replace("/(consumer)/shop")} />
      </ScreenScroll>
    );
  }

  const items = cart?.items ?? [];

  return (
    <ScreenScroll>
      <Label>Bag.</Label>
      <Display>Cart</Display>
      {msg ? <Banner message={msg} /> : null}

      {loading ? null : items.length === 0 ? (
        <EmptyState title="Empty cart" hint="Add a drop from the shop." />
      ) : (
        <Card>
          {items.map((it, i) => (
            <View key={it.id}>
              {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
              <Row style={{ justifyContent: "space-between" }}>
                <Body>{it.productId} · {it.size} ×{it.qty}</Body>
                <Label>{moneyFromCents(it.priceCents, { locale: prefs.locale, currency: prefs.currency })}</Label>
              </Row>
            </View>
          ))}
          <RuleLine style={{ marginVertical: space.sm }} />
          <Row style={{ justifyContent: "space-between" }}>
            <Label>Total</Label>
            <Body style={{ fontWeight: "600" }}>{moneyFromCents(cart?.totalCents ?? 0, { locale: prefs.locale, currency: prefs.currency })}</Body>
          </Row>
        </Card>
      )}

      <Card style={{ gap: space.sm }}>
        <Field label="Promo / access code" value={promo} onChangeText={setPromo} autoCapitalize="characters" placeholder="OXIDE10" />
        <Button title="Apply" onPress={applyPromo} disabled={!promo} />
        <Label>Shipping</Label>
        <SegControl
          options={[
            { value: "standard", label: "Standard" },
            { value: "express", label: "Express" },
          ]}
          value={shipping}
          onChange={setShipping}
        />
      </Card>

      <Button title={busy ? "Placing…" : "Checkout"} variant="primary" disabled={busy || items.length === 0} onPress={checkout} />
    </ScreenScroll>
  );
}

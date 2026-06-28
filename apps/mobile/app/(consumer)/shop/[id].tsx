// PDP v2 — gallery placeholder, size picker (variants), wishlist, add-to-cart.
// Level-gate guarded at add. Product is public discovery; add-to-cart is a
// member write via /cart/items.
import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Chip, Skeleton, Banner } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { useProduct } from "../../../src/data";
import { useSession } from "../../../src/session";
import { api } from "../../../src/api";
import { moneyFromCents } from "@ox/rbac";
import { can } from "@ox/rbac";

export default function PDP() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session, prefs } = useSession();
  const { data: product, loading } = useProduct(String(id));
  const [size, setSize] = useState<string | null>(null);
  const [wished, setWished] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <ScreenScroll><Skeleton height={240} /></ScreenScroll>;
  if (!product) return <ScreenScroll><Banner tone="danger" message="Product not found." /></ScreenScroll>;

  const level = session?.level ?? 1;
  const locked = product.gateLevel > level;

  async function add() {
    if (!product || !size || !can(session, "shop.buy")) return;
    setBusy(true);
    setMsg(null);
    try {
      await api.shop.addItem({ productId: product.id, size, qty: 1 });
      setMsg("Added to cart.");
    } catch (e: any) {
      setMsg(e?.message ?? "Couldn't add — check stock.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenScroll>
      <Label>{product.collection}</Label>
      <Display>{product.name}</Display>
      <Body style={{ fontWeight: "600" }}>{moneyFromCents(product.priceCents, { locale: prefs.locale, currency: prefs.currency })}</Body>

      {msg ? <Banner message={msg} /> : null}

      {/* Gallery placeholder — ruled square. */}
      <View style={{ height: 180, borderWidth: 1, borderColor: color.stone, backgroundColor: color.paperWarm, alignItems: "center", justifyContent: "center" }}>
        <Label>{product.colors.join(" · ") || "OX"}</Label>
      </View>

      <Card>
        <Label>Size</Label>
        <Row style={{ flexWrap: "wrap", marginTop: space.xs }}>
          {product.sizes.map((s) => (
            <Chip key={s} label={s} active={size === s} onPress={() => setSize(s)} />
          ))}
        </Row>
      </Card>

      {locked ? (
        <Banner tone="danger" message={`Locked — unlocks at level ${product.gateLevel}.`} />
      ) : (
        <>
          {can(session, "shop.buy") ? (
            <Button title={busy ? "Adding…" : size ? "Add to cart" : "Pick a size"} variant="primary" disabled={busy || !size} onPress={add} />
          ) : null}
        </>
      )}
      <Button title={wished ? "Saved" : "Save to wishlist"} onPress={() => setWished(true)} disabled={wished} />
      <Button title="Cart" variant="ghost" onPress={() => router.push("/(consumer)/cart")} />
    </ScreenScroll>
  );
}

// Shop — product grid with collection chips + level-gated drops. Products are
// public discovery; the level gate (gateLevel) locks drops above the member's
// level. Tap → PDP. Cart entry in the header.
import { useState, useMemo } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Chip, Skeleton, EmptyState } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { useProducts } from "../../../src/data";
import { useSession } from "../../../src/session";
import { moneyFromCents } from "@ox/rbac";

export default function Shop() {
  const router = useRouter();
  const { session, prefs } = useSession();
  const products = useProducts();
  const [collection, setCollection] = useState<string | undefined>();
  const level = session?.level ?? 1;

  const collections = useMemo(
    () => Array.from(new Set(products.data.map((p) => p.collection))),
    [products.data]
  );
  const shown = collection ? products.data.filter((p) => p.collection === collection) : products.data;

  return (
    <ScreenScroll>
      <Label>The drop.</Label>
      <Display>Shop</Display>
      <Button title="Cart" onPress={() => router.push("/(consumer)/cart")} />

      <Row style={{ flexWrap: "wrap" }}>
        <Chip label="All" active={!collection} onPress={() => setCollection(undefined)} />
        {collections.map((c) => (
          <Chip key={c} label={c} active={collection === c} onPress={() => setCollection(c)} />
        ))}
      </Row>

      {products.loading ? (
        <Skeleton height={200} />
      ) : shown.length === 0 ? (
        <EmptyState title="Empty collection" />
      ) : (
        shown.map((p) => {
          const locked = p.gateLevel > level;
          return (
            <Card key={p.id}>
              <Row style={{ justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: "600" }}>{p.name}</Body>
                  <Label>{p.collection}</Label>
                </View>
                <Body>{moneyFromCents(p.priceCents, { locale: prefs.locale, currency: prefs.currency })}</Body>
              </Row>
              {locked ? (
                <Row style={{ marginTop: space.sm, justifyContent: "space-between" }}>
                  <Label>Unlocks at LV {p.gateLevel}</Label>
                  <Chip label="Locked" />
                </Row>
              ) : (
                <Button title="View" onPress={() => router.push(`/(consumer)/shop/${p.id}`)} style={{ marginTop: space.sm }} />
              )}
            </Card>
          );
        })
      )}
    </ScreenScroll>
  );
}

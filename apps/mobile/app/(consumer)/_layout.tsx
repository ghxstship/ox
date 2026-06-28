// OX consumer surface — Home · Train · Tribe · Map · You (NAV.member.tabs).
// Nested stack routes (session/[id], shop, events, you/*) live under this group
// but are hidden from the tab bar via href:null.
import { Tabs } from "expo-router";
import { color, font } from "../../src/tokens";

export default function ConsumerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: color.salt, borderBottomWidth: 1, borderBottomColor: color.stone },
        headerTitleStyle: { fontFamily: font.mono, color: color.ink, letterSpacing: 1, textTransform: "uppercase" },
        tabBarActiveTintColor: color.oxide,
        tabBarInactiveTintColor: color.stone,
        tabBarStyle: { backgroundColor: color.salt, borderTopWidth: 1, borderTopColor: color.stone },
        tabBarLabelStyle: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="train" options={{ title: "Train", tabBarLabel: "Train" }} />
      <Tabs.Screen name="tribe" options={{ title: "Tribe", tabBarLabel: "Tribe" }} />
      <Tabs.Screen name="map" options={{ title: "Map", tabBarLabel: "Map" }} />
      <Tabs.Screen name="you" options={{ title: "You", tabBarLabel: "You" }} />
      {/* Nested stacks — not tabs */}
      <Tabs.Screen name="session/[id]" options={{ href: null, title: "Session" }} />
      <Tabs.Screen name="generate" options={{ href: null, title: "Generate" }} />
      <Tabs.Screen name="shop/index" options={{ href: null, title: "Shop" }} />
      <Tabs.Screen name="shop/[id]" options={{ href: null, title: "Product" }} />
      <Tabs.Screen name="cart" options={{ href: null, title: "Cart" }} />
      <Tabs.Screen name="events/index" options={{ href: null, title: "Events" }} />
      <Tabs.Screen name="events/[id]" options={{ href: null, title: "Event" }} />
      <Tabs.Screen name="search" options={{ href: null, title: "Search" }} />
      <Tabs.Screen name="onboarding" options={{ href: null, title: "Onboarding" }} />
      <Tabs.Screen name="you/wallet" options={{ href: null, title: "Wallet" }} />
      <Tabs.Screen name="you/credits" options={{ href: null, title: "Credits" }} />
      <Tabs.Screen name="you/plan" options={{ href: null, title: "Plan" }} />
      <Tabs.Screen name="you/body" options={{ href: null, title: "Body" }} />
      <Tabs.Screen name="you/schedule" options={{ href: null, title: "Schedule" }} />
      <Tabs.Screen name="you/settings" options={{ href: null, title: "Settings" }} />
    </Tabs>
  );
}

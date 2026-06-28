// OX mobile — root tab layout. Member surface: Home · Train · Tribe · Map · You
// (mirrors NAV.member.tabs in @ox/rbac). Square, ruled, one accent.
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { color, font } from "../src/tokens";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: color.salt, borderBottomWidth: 1, borderBottomColor: color.stone },
          headerTitleStyle: { fontFamily: font.mono, color: color.ink, letterSpacing: 1, textTransform: "uppercase" },
          tabBarActiveTintColor: color.oxide,
          tabBarInactiveTintColor: color.stone,
          tabBarStyle: { backgroundColor: color.salt, borderTopWidth: 1, borderTopColor: color.stone },
          tabBarLabelStyle: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
          // status conveyed by label, not hue alone (a11y)
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
        <Tabs.Screen name="train" options={{ title: "Train", tabBarLabel: "Train" }} />
        <Tabs.Screen name="tribe" options={{ title: "Tribe", tabBarLabel: "Tribe" }} />
        <Tabs.Screen name="map" options={{ title: "Map", tabBarLabel: "Map" }} />
        <Tabs.Screen name="you" options={{ title: "You", tabBarLabel: "You" }} />
      </Tabs>
    </>
  );
}

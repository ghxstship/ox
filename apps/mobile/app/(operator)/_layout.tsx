// OX operator surface — Today · Schedule · Members · Inbox · More
// (NAV[coach|host|admin].tabs). The Members tab label flips to "Clients" for a
// coach (membersLabel). RLS scopes the rows; can() gates the actions.
import { Tabs } from "expo-router";
import { NAV } from "@ox/rbac";
import { color, font } from "../../src/tokens";
import { useSession } from "../../src/session";

export default function OperatorLayout() {
  const { session } = useSession();
  const membersLabel = session ? NAV[session.role].membersLabel ?? "Members" : "Members";
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
      <Tabs.Screen name="index" options={{ title: "Today", tabBarLabel: "Today" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule", tabBarLabel: "Schedule" }} />
      <Tabs.Screen name="members" options={{ title: membersLabel, tabBarLabel: membersLabel }} />
      <Tabs.Screen name="inbox" options={{ title: "Inbox", tabBarLabel: "Inbox" }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarLabel: "More" }} />
    </Tabs>
  );
}

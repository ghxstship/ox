// OX mobile — root layout. Wraps the app in the session provider, loads fonts,
// and gates routing: signed-out → (auth)/sign-in; members → (consumer) tabs;
// coach/host/admin → (operator) tabs (per NAV[role].app from @ox/rbac).
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { NAV } from "@ox/rbac";
import { SessionProvider, useSession } from "../src/session";
import { useOxFonts } from "../src/fonts";
import { color } from "../src/tokens";

function Gate() {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const fontsReady = useOxFonts();

  useEffect(() => {
    if (loading || !fontsReady) return;
    const group = segments[0]; // "(auth)" | "(consumer)" | "(operator)" | undefined
    if (!session) {
      if (group !== "(auth)") router.replace("/(auth)/sign-in");
      return;
    }
    const surface = NAV[session.role].app; // "consumer" | "operator"
    const want = surface === "consumer" ? "(consumer)" : "(operator)";
    if (group !== want) {
      router.replace(surface === "consumer" ? "/(consumer)" : "/(operator)");
    }
  }, [session, loading, fontsReady, segments, router]);

  if (loading || !fontsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: color.paper, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={color.oxide} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.paper } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(consumer)" />
      <Stack.Screen name="(operator)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Gate />
    </SessionProvider>
  );
}

// OX mobile — font loading. The token bridge names three families:
//   DMSerifDisplay (display/editorial), Geist (body/UI), JetBrainsMono (labels).
// In a full native build these load via expo-font from @expo-google-fonts. Here
// we register the family-name keys so RN resolves them and fall back to system
// faces if the .ttf assets aren't bundled — typecheck/rendering both stay green.
// To ship real faces, add the @expo-google-fonts/* packages and require() the
// ttf modules in FONT_MAP below.
import { useFonts } from "expo-font";

// Map token family name -> bundled asset module. Left empty here so the app
// renders with system fallbacks; populate with require("../assets/fonts/*.ttf").
export const FONT_MAP: Record<string, number> = {};

/** Returns true once fonts are ready (immediately when none are bundled). */
export function useOxFonts(): boolean {
  const [loaded, error] = useFonts(FONT_MAP);
  // With an empty map expo-font resolves instantly; never block the app on a
  // font error — the family names degrade to platform defaults.
  return loaded || !!error || Object.keys(FONT_MAP).length === 0;
}

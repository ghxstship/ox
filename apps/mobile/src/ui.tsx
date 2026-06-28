// OX mobile — minimal primitives on the token bridge. Square, ruled, flat.
import { Text, View, type ViewProps, type TextProps } from "react-native";
import { color, font, space, rule } from "./tokens";

export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        { backgroundColor: color.salt, borderWidth: rule.width, borderColor: color.stone, padding: space.md, borderRadius: 0 },
        style,
      ]}
      {...rest}
    />
  );
}

export function Label({ style, ...rest }: TextProps) {
  return (
    <Text
      style={[{ fontFamily: font.mono, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: color.stone }, style]}
      {...rest}
    />
  );
}

export function Display({ style, ...rest }: TextProps) {
  return <Text style={[{ fontFamily: font.serif, fontSize: 28, color: color.ink }, style]} {...rest} />;
}

export function Body({ style, ...rest }: TextProps) {
  return <Text style={[{ fontFamily: font.sans, fontSize: 15, color: color.ink, lineHeight: 22 }, style]} {...rest} />;
}

/** XP bar — tonal copper fill on warm track (never a new hue). */
export function XPBar({ pct }: { pct: number }) {
  return (
    <View style={{ height: 8, backgroundColor: color.paperWarm, borderWidth: 1, borderColor: color.stone }}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", backgroundColor: color.oxide }} />
    </View>
  );
}

export function Screen({ style, ...rest }: ViewProps) {
  return <View style={[{ flex: 1, backgroundColor: color.paper, padding: space.lg, gap: space.md }, style]} {...rest} />;
}

// OX mobile — primitives on the token bridge. Square, ruled, flat, one accent.
// INVARIANTS: radius 0 (pills only for avatars/dots), 1px rules, no shadows,
// three font tokens, status by label+icon not hue alone, OX voice (terse).
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type TextProps,
  type ViewProps,
} from "react-native";
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

export function Mono({ style, ...rest }: TextProps) {
  return <Text style={[{ fontFamily: font.mono, fontSize: 13, color: color.ink }, style]} {...rest} />;
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

/** Scrolling screen wrapper — the common case. */
export function ScreenScroll({ children, contentStyle }: { children: React.ReactNode; contentStyle?: ViewProps["style"] }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.paper }} keyboardShouldPersistTaps="handled">
      <View style={[{ padding: space.lg, gap: space.md }, contentStyle]}>{children}</View>
    </ScrollView>
  );
}

/** 1px separation rule. */
export function RuleLine({ vertical, style }: { vertical?: boolean; style?: ViewProps["style"] }) {
  return (
    <View
      style={[
        vertical
          ? { width: rule.width, alignSelf: "stretch", backgroundColor: color.stone }
          : { height: rule.width, alignSelf: "stretch", backgroundColor: color.stone },
        style,
      ]}
    />
  );
}

export function Row({ style, gap = space.sm, ...rest }: ViewProps & { gap?: number }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]} {...rest} />;
}

/** Square, ruled button. Primary = copper fill; default = ruled; ghost = bare. */
export function Button({
  title,
  onPress,
  variant = "default",
  disabled,
  style,
}: {
  title: string;
  onPress?: PressableProps["onPress"];
  variant?: "primary" | "default" | "ghost";
  disabled?: boolean;
  style?: ViewProps["style"];
}) {
  const fill = variant === "primary" ? color.oxide : variant === "ghost" ? "transparent" : color.salt;
  const ink = variant === "primary" ? color.salt : color.ink;
  const border = variant === "ghost" ? "transparent" : color.stone;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          minHeight: 44,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          backgroundColor: fill,
          borderWidth: rule.width,
          borderColor: border,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: ink }}>
        {title}
      </Text>
    </Pressable>
  );
}

/** Mono caps chip. active => copper-keyed. */
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: PressableProps["onPress"];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: space.sm,
        paddingVertical: 4,
        borderWidth: rule.width,
        borderColor: active ? color.oxide : color.stone,
        backgroundColor: active ? color.oxide : "transparent",
      }}
    >
      <Text
        style={{
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: active ? color.salt : color.stone,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Booking gate badge (OXGate parity). State by label, copper-keyed. */
export type GateState = "included" | "credit" | "dropin" | "locked" | "overlimit";
const GATE_COPY: Record<GateState, string> = {
  included: "INCLUDED",
  credit: "1 CREDIT",
  dropin: "DROP-IN",
  locked: "LOCKED",
  overlimit: "OVER LIMIT",
};
export function Gate({ state }: { state: GateState }) {
  const filled = state === "included" || state === "credit";
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: space.sm,
        paddingVertical: 3,
        borderWidth: rule.width,
        borderColor: color.oxide,
        backgroundColor: filled ? color.oxide : "transparent",
      }}
    >
      <Text
        style={{
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 1,
          color: filled ? color.salt : color.oxide,
        }}
      >
        {GATE_COPY[state]}
      </Text>
    </View>
  );
}

/** Round avatar (pills allowed only here + dots). */
export function Avatar({ initial, size = 36 }: { initial: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: rule.width,
        borderColor: color.stone,
        backgroundColor: color.paperWarm,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontFamily: font.mono, fontSize: size * 0.34, color: color.ink, letterSpacing: 1 }}>{initial}</Text>
    </View>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2, minWidth: 80 }}>
      <Label>{label}</Label>
      <Text style={{ fontFamily: font.serif, fontSize: 22, color: color.ink }}>{value}</Text>
    </View>
  );
}

/** Segmented control — mono caps, copper active segment. */
export function SegControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Row gap={0} style={{ borderWidth: rule.width, borderColor: color.stone }}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              paddingVertical: space.sm,
              alignItems: "center",
              backgroundColor: active ? color.oxide : "transparent",
              borderLeftWidth: i === 0 ? 0 : rule.width,
              borderLeftColor: color.stone,
            }}
          >
            <Text
              style={{
                fontFamily: font.mono,
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: active ? color.salt : color.stone,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}

/** Labeled text field — ruled, square. */
export function Field({
  label,
  style,
  ...rest
}: TextInputProps & { label?: string }) {
  return (
    <View style={{ gap: 4 }}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        placeholderTextColor={color.stoneSoft}
        style={[
          {
            borderWidth: rule.width,
            borderColor: color.stone,
            paddingHorizontal: space.md,
            paddingVertical: space.sm,
            minHeight: 44,
            fontFamily: font.sans,
            fontSize: 15,
            color: color.ink,
            backgroundColor: color.salt,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

/** Loading skeleton block. */
export function Skeleton({ height = 60 }: { height?: number }) {
  return <View style={{ height, backgroundColor: color.paperWarm, borderWidth: rule.width, borderColor: color.stoneSoft }} />;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card style={{ alignItems: "center", gap: space.xs }}>
      <Label>{title}</Label>
      {hint ? <Body style={{ color: color.stone, textAlign: "center" }}>{hint}</Body> : null}
    </Card>
  );
}

/** Error banner — danger tone by label + icon glyph, not hue alone. */
export function Banner({ tone = "info", message }: { tone?: "info" | "danger"; message: string }) {
  const danger = tone === "danger";
  return (
    <View
      style={{
        borderWidth: rule.width,
        borderColor: danger ? color.safetyRed : color.stone,
        backgroundColor: color.salt,
        padding: space.sm,
        flexDirection: "row",
        gap: space.sm,
        alignItems: "center",
      }}
    >
      <Text style={{ fontFamily: font.mono, fontSize: 13, color: danger ? color.safetyRed : color.stone }}>
        {danger ? "!" : "i"}
      </Text>
      <Body style={{ flex: 1 }}>{message}</Body>
    </View>
  );
}

/** Status pill: a tiny dot + mono caps label (status by label, not hue). */
export function StatusTag({ label, on }: { label: string; on?: boolean }) {
  return (
    <Row gap={space.xs}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: on ? color.oxide : color.stoneSoft,
        }}
      />
      <Label>{label}</Label>
    </Row>
  );
}

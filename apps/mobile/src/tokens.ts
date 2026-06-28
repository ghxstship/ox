// OX mobile — token bridge. The DS DOM components don't run on native, so we
// re-implement the *visual* tokens (1px rules, square, copper) from
// packages/ds/styles/tokens. In a full pipeline these are generated from
// tokens/tokens.dtcg.json via Style-Dictionary; mirrored here by hand.
// INVARIANTS: one accent (oxide), square (radius 0 except pills), flat (no shadow),
// separation by 1px rules.

export const color = {
  ink: "#0B0B0A",
  inkSoft: "#1A1916",
  paper: "#ECE7DA",
  paperWarm: "#E4DDCB",
  salt: "#F6F2E8",
  stone: "#6B6660",
  stoneSoft: "#9B958C",
  oxide: "#B5552E", // THE one accent — keep ≤10% of any surface
  oxideDeep: "#8C3F22",
  oxideBright: "#C9612F",
  bgRaised: "#15140F",
  // status conveyed by TEXT + ICON, never hue alone; these tonal steps only
  zone1: "#C9C2B2",
  zone2: "#9B958C",
  zone3: "#C9612F",
  zone4: "#B5552E",
  zone5: "#8C3F22",
  // life-safety signage — the single documented hue exemption
  safetyRed: "#C8102E",
  isoGreen: "#237F52",
} as const;

export const font = {
  serif: "DMSerifDisplay", // load via expo-font; display/editorial
  sans: "Geist", // body / app UI
  mono: "JetBrainsMono", // labels / data / the mark (caps)
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radius = { none: 0, pill: 999, credential: 10 } as const;

export const rule = { width: 1, color: color.stone } as const;

/** Level/tier are tonal copper steps — never new hues. */
export const xp = { track: color.paperWarm, fill: color.oxide } as const;

export type OxColor = keyof typeof color;

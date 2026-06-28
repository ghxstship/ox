// @ox/ds — barrel export of the OX Design System React components.
// Auto-generated from components/**/*.jsx. The canonical CSS lives in ../styles.
// Load styles once at app root:  import "@ox/ds/styles.css";

export * from "./components/app/OXCredential";
export * from "./components/app/OXOTP";
export * from "./components/app/OXPost";
export * from "./components/brand/OXCode";
export * from "./components/brand/OXMark";
export * from "./components/brand/OXTierBadge";
export * from "./components/core/OXButton";
export * from "./components/core/OXChip";
export * from "./components/core/OXSegmented";
export * from "./components/core/OXTabs";
export * from "./components/data/OXCard";
export * from "./components/data/OXDataTable";
export * from "./components/data/OXKpi";
export * from "./components/data/OXMeter";
export * from "./components/data/OXRow";
export * from "./components/data/OXTable";
export * from "./components/editorial/OXProse";
export * from "./components/feedback/OXAlert";
export * from "./components/feedback/OXEmpty";
export * from "./components/feedback/OXTicker";
export * from "./components/fitness/OXExerciseCard";
export * from "./components/fitness/OXLevelBadge";
export * from "./components/fitness/OXTribeBoard";
export * from "./components/forms/OXChoice";
export * from "./components/forms/OXField";
export * from "./components/forms/OXInput";
export * from "./components/forms/OXSelect";
export * from "./components/forms/OXSwitch";
export * from "./components/game/OXWorldMap";
export * from "./components/layout/OXContainer";
export * from "./components/media/OXNowPlaying";
export * from "./components/navigation/OXIcon";
export * from "./components/overlays/OXModal";
export * from "./components/product/OXAppShell";
export * from "./components/xr/OXARCapture";

// Disambiguate: OXTier (the tier union) is declared in both OXMark and
// OXTierBadge .d.ts. Explicitly re-export one so the wildcard collision resolves.
export type { OXTier } from "./components/brand/OXMark";

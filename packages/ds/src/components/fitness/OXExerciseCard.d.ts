import React from "react";

/**
 * OXExerciseCard — the unit of Safari discovery (a move + equipment + floors).
 * This file holds the training/discovery group: OXExerciseCard, OXFloorMatch,
 * OXSceneryPicker, OXSetRow, OXMetricRing, OXZoneBar, OXRecoveryMap, OXRestTimer,
 * OXExercisePlayer, OXFilterBar, OXPRChip.
 */
export interface OXExerciseCardProps {
  index?: string | number;
  name: React.ReactNode;
  equipment?: string;
  muscles?: string;
  floors?: number;
  onFind?: () => void;
  style?: React.CSSProperties;
}
export function OXExerciseCard(props: OXExerciseCardProps): JSX.Element;
export function OXFloorMatch(props: { distance: string; name: React.ReactNode; has: string; scenery?: string; xp?: number; isHome?: boolean; onClick?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXSceneryPicker(props: { options: string[]; value: string; onChange: (v: string) => void; title?: React.ReactNode; sub?: string; style?: React.CSSProperties }): JSX.Element;
export function OXSetRow(props: { index: number; weight?: number | string; reps: number | string; rpe?: number; done?: boolean; onToggle?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXMetricRing(props: { value: number; label?: string; size?: number; metrics?: { label: string; value: React.ReactNode }[]; style?: React.CSSProperties }): JSX.Element;
export function OXZoneBar(props: { zones: { label: string; value: number; zone: 1 | 2 | 3 | 4 | 5; display?: string }[]; style?: React.CSSProperties }): JSX.Element;
export function OXRecoveryMap(props: { regions: { name: string; state: "fresh" | "light" | "worked" | "spent" }[]; style?: React.CSSProperties }): JSX.Element;
export function OXRestTimer(props: { seconds: number; total?: number; running?: boolean; onSkip?: () => void; style?: React.CSSProperties }): JSX.Element;
/** OXExercisePlayer — step-by-step follow-along: demo media (children) + built-in timer, set N/total, cue, controls. */
export function OXExercisePlayer(props: { name: React.ReactNode; setIndex?: number; setTotal?: number; target?: string; cue?: string; phase?: "work" | "rest"; timer?: string; onPrev?: () => void; onNext?: () => void; onLog?: () => void; children?: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
/** OXFilterBar — discovery filter by type/duration/equipment/muscle. Controlled via value map + onChange(groupKey, option). */
export function OXFilterBar(props: { groups: { key: string; label: string; options: string[] }[]; value?: Record<string, string | null>; onChange?: (groupKey: string, option: string | null) => void; style?: React.CSSProperties }): JSX.Element;
/** OXPRChip — personal-record achievement stamp (Strava-style): record mark, hero value, delta + previous-best comparison, optional mono sparkline of recent maxes. */
export function OXPRChip(props: { lift: string; value: number | string; unit?: string; delta?: number | string; prev?: number | string; history?: number[]; fresh?: boolean; style?: React.CSSProperties }): JSX.Element;

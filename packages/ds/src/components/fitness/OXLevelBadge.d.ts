import React from "react";

/**
 * OXLevelBadge — the "LV n" chip + rank. This file holds the OX game layer:
 * OXLevelBadge, OXXPBar, OXStreak, OXQuestRow, OXChallengeHero, OXSpeciesBadge,
 * OXMedal. All copper→stone tonal (one-accent rule). Pairs with the fitness
 * tokens in tokens/fitness.css.
 */
export interface OXLevelBadgeProps {
  level: number | string;
  rank?: string;
  tone?: "oxide" | "ink";
  style?: React.CSSProperties;
}
export function OXLevelBadge(props: OXLevelBadgeProps): JSX.Element;
export function OXXPBar(props: { value: number; max: number; toNext?: number; compact?: boolean; style?: React.CSSProperties }): JSX.Element;
export function OXStreak(props: { days: number; active?: boolean; style?: React.CSSProperties }): JSX.Element;
export function OXQuestRow(props: { glyph?: React.ReactNode; name: React.ReactNode; sub?: string; current?: number; target?: number; state?: "active" | "done" | "locked"; onClick?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXChallengeHero(props: { kicker?: string; title: React.ReactNode; sub?: string; pills?: { label: string; on?: boolean }[]; style?: React.CSSProperties }): JSX.Element;
export function OXSpeciesBadge(props: { glyph?: React.ReactNode; label?: string; earned?: boolean; count?: number; style?: React.CSSProperties }): JSX.Element;
export function OXMedal(props: { glyph?: React.ReactNode; title: React.ReactNode; detail?: string; earned?: boolean; style?: React.CSSProperties }): JSX.Element;

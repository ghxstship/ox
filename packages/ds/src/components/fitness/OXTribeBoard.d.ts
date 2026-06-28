import React from "react";

/**
 * OXTribeBoard — ranked tribe leaderboard. This file holds the social /
 * booking / coaching group: OXTribeBoard, OXClassRow, OXBookingCard,
 * OXCoachCard, OXEventCard, OXRaidCard, OXCheckIn, OXHerdThat.
 */
export interface OXTribeBoardProps {
  rows: { rank: number | string; name: string; xp: number | string; initial?: string; me?: boolean }[];
  unit?: string;
  style?: React.CSSProperties;
}
export function OXTribeBoard(props: OXTribeBoardProps): JSX.Element;
export function OXClassRow(props: { time: string; title: React.ReactNode; coach?: string; floor?: string; spots?: number; status?: "open" | "filling" | "full" | "booked"; onBook?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXBookingCard(props: { title: React.ReactNode; when: string; where: string; locality?: string; status?: string; code?: string; style?: React.CSSProperties }): JSX.Element;
export function OXCoachCard(props: { name: string; specialty?: string; meta?: string; initial?: string; action?: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXEventCard(props: { day: string; title: React.ReactNode; host?: string; attendees?: number; soft?: boolean; status?: "open" | "going"; onRsvp?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXRaidCard(props: { title: React.ReactNode; when: string; floor?: string; filled: number; capacity: number; rewardXp?: number; onJoin?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXCheckIn(props: { floor: React.ReactNode; code?: string; xp?: number; style?: React.CSSProperties }): JSX.Element;
/** OXHerdThat — the "Herd that" reaction / co-sign stamp (the OX like/cheer). Controlled via active+onToggle, or uncontrolled. */
export function OXHerdThat(props: { active?: boolean; count?: number; onToggle?: (next: boolean) => void; size?: "sm" | "md"; withAvatars?: { initial?: string }[]; label?: string; style?: React.CSSProperties }): JSX.Element;

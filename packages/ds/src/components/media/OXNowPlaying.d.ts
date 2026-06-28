import React from "react";

export type OXService = "spotify" | "apple" | "soundcloud" | "tidal";
export type OXCurationTier = "signature" | "featured" | "community";

export interface OXServiceBadgeProps extends React.HTMLAttributes<HTMLElement> {
  service?: OXService;
  connected?: boolean;
  selected?: boolean;
  label?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
}
/** Neutral chip for a streaming service — monogram + name, never the real logo. */
export function OXServiceBadge(props: OXServiceBadgeProps): JSX.Element;

export interface OXCurationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tier?: OXCurationTier;
}
/** Curation-tier label: Signature (team), Featured (co-curated), Community. */
export function OXCurationBadge(props: OXCurationBadgeProps): JSX.Element;

export interface OXUpvoteProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  count?: number;
  on?: boolean;
  onToggle?: () => void;
  size?: "sm" | "md";
}
/** Upvote toggle with count — the community quality signal. */
export function OXUpvote(props: OXUpvoteProps): JSX.Element;

export interface OXSongRowProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  art?: string;
  title: string;
  artist?: string;
  dur?: string;
  bpm?: number;
  /** The workout (exercise/segment) this song is mapped to. */
  workout?: string;
  playing?: boolean;
  locked?: boolean;
  /** Open the per-workout song swap picker. */
  onSwap?: () => void;
  onPlay?: () => void;
}
/** One workout ↔ one song, with the per-workout swap control. */
export function OXSongRow(props: OXSongRowProps): JSX.Element;

export interface OXNowPlayingProps extends React.HTMLAttributes<HTMLDivElement> {
  art?: string;
  title: string;
  artist?: string;
  /** The current workout this track is powering. */
  forWorkout?: string;
  service?: OXService;
  progress?: number;
  elapsed?: string;
  dur?: string;
  playing?: boolean;
  compact?: boolean;
  onPlay?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}
/** Now-playing surface bound to the CURRENT workout in the program. */
export function OXNowPlaying(props: OXNowPlayingProps): JSX.Element;

export interface OXPairingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  author?: string;
  tier?: OXCurationTier;
  service?: OXService;
  tracks?: number;
  duration?: string;
  upvotes?: number;
  upvoted?: boolean;
  cover?: string;
  promoted?: boolean;
  onUpvote?: () => void;
  onOpen?: () => void;
}
/** A published program+playlist pairing for the discovery feed. */
export function OXPairingCard(props: OXPairingCardProps): JSX.Element;

export interface OXCadenceFit { pct: number; label: string; delta: number; lock: boolean; halftime?: boolean; }

export interface OXCadenceMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  bpm?: number;
  /** The move's target cadence BPM. */
  target?: number;
  fit?: OXCadenceFit;
  compact?: boolean;
  dark?: boolean;
}
/** BPM-fit gauge: a song's tempo vs the move's target cadence (half/double aware). */
export function OXCadenceMeter(props: OXCadenceMeterProps): JSX.Element;

export interface OXEnergyArcStep { label?: string; zone?: number; active?: boolean; done?: boolean; }
export interface OXEnergyArcProps extends React.HTMLAttributes<HTMLDivElement> {
  steps?: OXEnergyArcStep[];
  onJump?: (i: number) => void;
}
/** The playlist's energy curve across the session's moves (warmup → work → finish). */
export function OXEnergyArc(props: OXEnergyArcProps): JSX.Element;

export interface OXTrackTimerProps extends React.HTMLAttributes<HTMLDivElement> {
  art?: string; title: string; artist?: string; forWorkout?: string; service?: OXService;
  bpm?: number; target?: number; fit?: OXCadenceFit;
  set?: number; sets?: number; resting?: boolean; restLeft?: number; restTotal?: number; playing?: boolean;
  /** Log the current set — drives the music: rest rides the breakdown, last set auto-cues next track. */
  onLogSet?: () => void; onSkipRest?: () => void; onPlay?: () => void; onPrev?: () => void; onNext?: () => void;
}
/** Now-playing fused with the SET timer — logging a set advances the music. */
export function OXTrackTimer(props: OXTrackTimerProps): JSX.Element;

export interface OXRaidMember { initial: string; name?: string; me?: boolean; }
export interface OXRaidRoomProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string; floor?: string; host?: string; going?: number; members?: OXRaidMember[];
  art?: string; songTitle?: string; artist?: string; bpm?: number; forWorkout?: string; service?: OXService;
  live?: boolean; playing?: boolean;
  onLeave?: () => void; onPlay?: () => void; onPrev?: () => void; onNext?: () => void;
}
/** Synced group session — the herd locked to ONE track; a live drop countdown pulses everyone at once. */
export function OXRaidRoom(props: OXRaidRoomProps): JSX.Element;

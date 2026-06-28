import React from "react";

export type OXMapNodeType = "floor" | "raid" | "wild" | "drop" | "event";
export type OXSpeciesTier = "common" | "rare" | "epic" | "legendary";

export interface OXMapPinProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: OXMapNodeType;
  label?: string;
  sub?: string;
  live?: boolean;
  active?: boolean;
  held?: "mine" | "rival" | null;
  onClick?: () => void;
}
/** A single pin on the OX map (floor · raid · wild · drop · event). */
export function OXMapPin(props: OXMapPinProps): JSX.Element;

export interface OXMapNode {
  id: string; type: OXMapNodeType; label: string; sub?: string;
  x: number; y: number; live?: boolean; raidId?: string; speciesId?: string;
}
export interface OXWorldMapProps extends React.HTMLAttributes<HTMLDivElement> {
  nodes?: OXMapNode[];
  /** Normalized (0–1) position of the "you" marker. */
  you?: { x: number; y: number };
  activeId?: string;
  /** Returns 'mine' | 'rival' | null for a node's territory state. */
  heldOf?: (node: OXMapNode) => "mine" | "rival" | null;
  onPin?: (node: OXMapNode) => void;
  height?: number;
}
/** Stylized exploration map (not real GPS) — pins placed by normalized x/y. */
export function OXWorldMap(props: OXWorldMapProps): JSX.Element;

export interface OXSpeciesCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name?: string;
  glyph?: React.ReactNode;
  tier?: OXSpeciesTier;
  region?: string;
  lore?: string;
  earned?: boolean;
  onClick?: () => void;
}
/** A collectible creature in the dex — earned (glyph + region) or locked (silhouette). */
export function OXSpeciesCard(props: OXSpeciesCardProps): JSX.Element;

export interface OXCaptureMomentProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  glyph?: React.ReactNode;
  tier?: OXSpeciesTier;
  region?: string;
  lore?: string;
  xp?: number;
  onConfirm?: () => void;
  onDismiss?: () => void;
}
/** The full-screen capture beat — fires when a target move summons a new species. */
export function OXCaptureMoment(props: OXCaptureMomentProps): JSX.Element;

export interface OXTeam { id: string; name: string; glyph?: React.ReactNode; members?: number; score?: number; }
export interface OXTeamBarProps extends React.HTMLAttributes<HTMLDivElement> {
  teams?: OXTeam[];
  myTeam?: string;
  onPick?: (id: string) => void;
}
/** City/global pride standings (team meta) — ranked, your pride highlighted. */
export function OXTeamBar(props: OXTeamBarProps): JSX.Element;

export interface OXFloorControlProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  heldName?: string;
  held?: "mine" | "rival" | null;
  defense?: number;
  you?: string;
  onClaim?: () => void;
}
/** A floor's territory state — holding pride, defense meter, claim/defend action. */
export function OXFloorControl(props: OXFloorControlProps): JSX.Element;

export interface OXLiveEventWave { t: string; name: string; sub?: string; live?: boolean; }
export interface OXLiveEventProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string; kicker?: string; live?: boolean; endsIn?: number; multiplier?: number;
  going?: number; floor?: string; featured?: React.ReactNode[]; bonuses?: string[]; waves?: OXLiveEventWave[];
  joined?: boolean; compact?: boolean; onJoin?: () => void; onLeave?: () => void;
}
/** A map-wide live event (GO-Fest-style) — countdown, XP multiplier, featured spawns, waves. */
export function OXLiveEvent(props: OXLiveEventProps): JSX.Element;

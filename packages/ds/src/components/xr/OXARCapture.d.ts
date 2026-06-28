import React from "react";

export type OXXRDevice = "specs" | "headset" | "phone";

export interface OXXRFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Device profile. `specs` = Snap SPECS AR glasses (Snap OS, see-through). */
  device?: OXXRDevice;
  status?: string;
  /** Show the EyeConnect (eye-contact multiplayer) affordance. */
  eyeConnect?: boolean;
  hint?: string;
  children?: React.ReactNode;
}
/** HUD framing for an XR view — corner brackets, device strip, input hint. */
export function OXXRFrame(props: OXXRFrameProps): JSX.Element;

export interface OXARCaptureProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  glyph?: React.ReactNode;
  tier?: string;
  region?: string;
  device?: OXXRDevice;
  locked?: boolean;
  onCapture?: () => void;
  onClose?: () => void;
}
/** AR species capture — a reticle locks on the anchored creature; pinch/look/say to capture. */
export function OXARCapture(props: OXARCaptureProps): JSX.Element;

export interface OXARFormCue { text: string; ok?: boolean; }
export interface OXARFormOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  move?: string;
  rep?: number;
  reps?: number;
  tempo?: string;
  zone?: number;
  device?: OXXRDevice;
  cues?: OXARFormCue[];
  onClose?: () => void;
}
/** AR form coaching — a tracked side-view skeleton, bar path, live cues, rep/tempo/zone. */
export function OXARFormOverlay(props: OXARFormOverlayProps): JSX.Element;

export interface OXSpatialMember { initial: string; name?: string; me?: boolean; }
export interface OXSpatialRaidProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  members?: OXSpatialMember[];
  songTitle?: string;
  forWorkout?: string;
  going?: number;
  device?: OXXRDevice;
  playing?: boolean;
  onLeave?: () => void;
}
/** The synced raid as a shared spatial session — herdmates at depth, one track, a live drop. */
export function OXSpatialRaid(props: OXSpatialRaidProps): JSX.Element;

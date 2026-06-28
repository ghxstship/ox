import React from "react";

/** OXTier — membership tier. */
export type OXTier = "founder" | "compass" | "sound" | "distant";

/**
 * OXMark — the OX mark, set as live type (the mark IS type, not artwork).
 */
export interface OXMarkProps {
  /** "wordmark" = horizontal; "flag" = stacked (rotated 90° CW). */
  as?: "wordmark" | "flag";
  /** px number or any CSS length. Min 10px. */
  size?: number | string;
  color?: string;
  style?: React.CSSProperties;
}
export function OXMark(props: OXMarkProps): JSX.Element;

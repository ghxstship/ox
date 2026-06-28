import React from "react";

/** OXChip — compact mono-caps label/status chip. */
export interface OXChipProps {
  variant?: "default" | "solid" | "oxide" | "oxide-line" | "ghost";
  /** Prepends the Oxide "live" dot. */
  live?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXChip(props: OXChipProps): JSX.Element;

import React from "react";

/**
 * OXButton — the primary action control: rectangular, JetBrains-Mono caps
 * label, hover flips fill ⇄ ground. Use for any commit/navigation action.
 */
export interface OXButtonProps {
  /** "default" outline · "primary" solid ink · "oxide" copper · "ghost" muted. */
  variant?: "default" | "primary" | "oxide" | "ghost";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  /** Trailing arrow that nudges right on hover. */
  arrow?: boolean;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXButton(props: OXButtonProps): JSX.Element;

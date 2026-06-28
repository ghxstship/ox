import React from "react";

export type OXFieldState = "default" | "error" | "success" | "disabled";

/**
 * OXField — labeled field wrapper: mono-caps label + optional serif-italic
 * hint + control (children) + help/error text. Wrap every form control.
 */
export interface OXFieldProps {
  label: string;
  /** Serif-italic hint shown right of the label (e.g. "optional"). */
  hint?: string;
  /** Help OR error/success text below the control. */
  help?: string;
  state?: OXFieldState;
  htmlFor?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXField(props: OXFieldProps): JSX.Element;

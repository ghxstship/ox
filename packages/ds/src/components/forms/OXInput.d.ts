import React from "react";

/** OXInput — ruled serif text input / textarea. */
export interface OXInputProps {
  value?: string;
  placeholder?: string;
  state?: "default" | "error" | "success" | "disabled";
  multiline?: boolean;
  rows?: number;
  onChange?: (v: string) => void;
  style?: React.CSSProperties;
}
export function OXInput(props: OXInputProps): JSX.Element;

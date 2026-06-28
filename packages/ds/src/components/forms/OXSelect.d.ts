import React from "react";

/** OXSelect — ruled serif native select with Oxide caret. */
export interface OXSelectProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  disabled?: boolean;
  onChange?: (v: string) => void;
  style?: React.CSSProperties;
}
export function OXSelect(props: OXSelectProps): JSX.Element;

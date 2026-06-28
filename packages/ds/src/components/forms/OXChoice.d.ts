import React from "react";

/** OXChoice — radio/checkbox row; checked fills Oxide. */
export interface OXChoiceProps {
  type?: "radio" | "checkbox";
  name?: string;
  label: React.ReactNode;
  sub?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  style?: React.CSSProperties;
}
export function OXChoice(props: OXChoiceProps): JSX.Element;

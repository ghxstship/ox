import React from "react";

/** OXEmpty — empty-state surface with serif mark, title, sub, action. */
export interface OXEmptyProps {
  mark?: React.ReactNode;
  title: React.ReactNode;
  sub?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXEmpty(props: OXEmptyProps): JSX.Element;

import React from "react";

/** OXRow — indexed list row with serif title/sub and a mono action. */
export interface OXRowProps {
  index?: string;
  title: React.ReactNode;
  sub?: string;
  action?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function OXRow(props: OXRowProps): JSX.Element;

import React from "react";

/** OXTable — ruled table; mono head, serif body, italic-Oxide amounts. */
export interface OXTableColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  /** Render this column in the mono amount style (right-aligned). */
  amount?: boolean;
}
export interface OXTableProps {
  columns: OXTableColumn[];
  rows: Record<string, React.ReactNode>[];
  style?: React.CSSProperties;
}
export function OXTable(props: OXTableProps): JSX.Element;

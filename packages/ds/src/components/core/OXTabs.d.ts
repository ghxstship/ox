import React from "react";

/** OXTabs — underline filter tabs (links). */
export interface OXTabsProps {
  items: { label: string; active?: boolean; href?: string }[];
  style?: React.CSSProperties;
}
export function OXTabs(props: OXTabsProps): JSX.Element;

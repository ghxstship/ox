import React from "react";

/** OXTicker — Oxide marquee strip; items joined by a dim delimiter. */
export interface OXTickerProps {
  items: string[];
  style?: React.CSSProperties;
}
export function OXTicker(props: OXTickerProps): JSX.Element;

import React from "react";

/** OXMeter — capacity/threshold meter; fill turns Stone past lockAt. */
export interface OXMeterProps {
  title: string;
  current: number;
  total: number;
  /** When current ≥ lockAt the fill turns Stone and reads the locked label. */
  lockAt?: number;
  openLabel?: string;
  lockedLabel?: string;
  style?: React.CSSProperties;
}
export function OXMeter(props: OXMeterProps): JSX.Element;

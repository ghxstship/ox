import React from "react";

/** OXSwitch — square toggle; on fills Oxide. */
export interface OXSwitchProps {
  on: boolean;
  onChange: (v: boolean) => void;
  style?: React.CSSProperties;
}
export function OXSwitch(props: OXSwitchProps): JSX.Element;

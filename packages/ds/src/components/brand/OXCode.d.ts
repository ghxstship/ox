import React from "react";

/** OXCode — short mono location/pillar code, e.g. "MIA", "MUS-VI". */
export interface OXCodeProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXCode(props: OXCodeProps): JSX.Element;

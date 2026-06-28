import React from "react";

/**
 * OXAlert — inline Oxide-edged alert bar (mono caps + leading dot).
 */
export interface OXAlertProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXAlert(props: OXAlertProps): JSX.Element;

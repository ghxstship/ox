import React from "react";

/** OXKpi — stat card: label, big serif value, optional delta. */
export interface OXKpiProps {
  label: string;
  value: React.ReactNode;
  delta?: string;
  trend?: "up" | "down";
  style?: React.CSSProperties;
}
export function OXKpi(props: OXKpiProps): JSX.Element;

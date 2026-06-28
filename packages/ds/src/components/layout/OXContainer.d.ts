import React from "react";

/**
 * OXContainer — page container. The layout family lives here: OXContainer,
 * OXGrid, OXCol, OXCover, OXCTABand, OXFeatureGrid, OXSplit (components.css §15).
 */
export interface OXContainerProps {
  reading?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXContainer(props: OXContainerProps): JSX.Element;
export function OXGrid(props: { children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXCol(props: { span?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 12; children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXCover(props: { kicker?: string; title: React.ReactNode; children?: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXCTABand(props: { title: React.ReactNode; action: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXFeatureGrid(props: { children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXSplit(props: { left: React.ReactNode; right: React.ReactNode; style?: React.CSSProperties }): JSX.Element;

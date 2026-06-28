import React from "react";

/**
 * OXProse — long-form editorial wrapper. The editorial family lives here:
 * OXProse, OXPullquote, OXFigure, OXReadMore, OXArticleHeader (components.css §13).
 */
export interface OXProseProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXProse(props: OXProseProps): JSX.Element;
export function OXPullquote(props: { children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXFigure(props: { caption?: string; children?: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXReadMore(props: { href: string; children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXArticleHeader(props: { kicker: string; title: React.ReactNode; byline?: string[]; style?: React.CSSProperties }): JSX.Element;

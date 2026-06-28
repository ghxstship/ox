import React from "react";

export type OXProduct = "member" | "operate" | "admin";

/**
 * OXAppShell — the OX SaaS console shell (sidebar + topbar + content),
 * re-skinned per app by a copper accent STEP (never a new hue). The product
 * layer also lives here: OXBadge, OXTag, OXKbd, OXStat, OXProgress, OXSpinner,
 * OXSteps, OXBanner, OXCommandPalette (product-theme.css / platform.css).
 */
export interface OXAppShellProps {
  product?: OXProduct;
  appCode?: string;
  brand?: React.ReactNode;
  nav?: { group?: string; items: { label: React.ReactNode; href?: string; active?: boolean; badge?: React.ReactNode }[] }[];
  topbar?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXAppShell(props: OXAppShellProps): JSX.Element;
export function OXBadge(props: { tone?: "ok" | "warn" | "danger" | "info" | "neutral"; children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXTag(props: { children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXKbd(props: { children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXStat(props: { value: React.ReactNode; label: string; delta?: string; style?: React.CSSProperties }): JSX.Element;
export function OXProgress(props: { value?: number; style?: React.CSSProperties }): JSX.Element;
export function OXSpinner(props: { style?: React.CSSProperties }): JSX.Element;
export function OXSteps(props: { steps: { label: string; state?: "done" | "now" }[]; style?: React.CSSProperties }): JSX.Element;
export function OXBanner(props: { tone?: "info" | "ok" | "warn" | "danger"; children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXCommandPalette(props: { placeholder?: string; items?: { label: string; kbd?: string; icon?: React.ReactNode }[]; style?: React.CSSProperties }): JSX.Element;

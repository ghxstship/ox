import React from "react";

export type OXIconName =
  | "house" | "events" | "feed" | "wallet" | "profile" | "search" | "back"
  | "chevron" | "close" | "add" | "like" | "comment" | "repost" | "share"
  | "settings" | "bell" | "lock" | "check" | "external"
  | "calendar" | "clock" | "pin" | "compass" | "music" | "fitness"
  | "adventure" | "innovation" | "ticket" | "key" | "edit" | "trash"
  | "download" | "upload" | "filter" | "sort" | "play" | "pause" | "mail"
  | "globe" | "grid" | "menu" | "more" | "minus" | "qr" | "filledcheck";

/**
 * OXIcon — a self-contained OX line icon (19 in the set; line only, 1.5
 * stroke, currentColor, no fill, wayfinding only). The navigation family
 * lives in this file: OXIcon, OXAvatar, OXListRow, OXSetting, OXBreadcrumbs,
 * OXSiteHeader, OXSiteFooter, OXPagination.
 */
export interface OXIconProps {
  name: OXIconName;
  size?: "sm" | "md" | "lg" | number;
  title?: string;
  style?: React.CSSProperties;
}
export function OXIcon(props: OXIconProps): JSX.Element;
export function OXAvatar(props: { initial?: React.ReactNode; src?: string; size?: number; style?: React.CSSProperties }): JSX.Element;
export function OXListRow(props: { icon?: React.ReactNode; title: React.ReactNode; sub?: string; trail?: string; chevron?: boolean; href?: string; onClick?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXSetting(props: { title: string; sub?: string; control: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXBreadcrumbs(props: { trail: { label: string; href?: string }[]; style?: React.CSSProperties }): JSX.Element;
export function OXSiteHeader(props: { brand: React.ReactNode; nav: { label: string; href: string; active?: boolean }[]; cta?: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXSiteFooter(props: { columns: { heading: string; links: { label: string; href: string }[] }[]; style?: React.CSSProperties }): JSX.Element;
export function OXPagination(props: { page: number; pageCount: number; total?: number; onPage: (p: number) => void; style?: React.CSSProperties }): JSX.Element;

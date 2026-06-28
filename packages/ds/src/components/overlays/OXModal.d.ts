import React from "react";

/**
 * useDismissable — the OX overlay behaviour contract as a hook: body
 * scroll-lock, Tab focus-trap, focus-in on open + restore on close, and
 * onClose on Escape. Returns a ref to attach to the panel element. Used
 * internally by OXModal/OXSheet; exported for custom overlays.
 */
export function useDismissable(open: boolean, onClose: () => void): React.RefObject<HTMLDivElement>;

/**
 * OXModal — centered dialog (Ink hairline). The OX overlay family lives in
 * this file: OXModal, OXSheet, OXToast, OXFab, OXTooltip, OXMenu, OXPopover,
 * OXAccordion, OXTabset, OXScrim. Each maps to components.css §10.5 / §12.
 * OXModal/OXSheet own the full dismiss contract (scroll-lock, focus-trap,
 * focus-restore, Escape, scrim-click); pass `label`/`labelledBy` for a name.
 */
export interface OXModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name when there's no visible heading to point at. */
  label?: string;
  /** id of the visible heading that names the dialog (preferred). */
  labelledBy?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function OXModal(props: OXModalProps): JSX.Element | null;
export function OXSheet(props: OXModalProps): JSX.Element | null;
export function OXScrim(props: { onClick?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXToast(props: { message: string; visible?: boolean; tone?: "default" | "success"; style?: React.CSSProperties }): JSX.Element | null;
export function OXFab(props: { icon?: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXTooltip(props: { label: string; style?: React.CSSProperties }): JSX.Element;
export interface OXMenuItem { label: string; key?: string; icon?: React.ReactNode; danger?: boolean; separatorAfter?: boolean; onSelect?: () => void; }
export function OXMenu(props: { items: OXMenuItem[]; onClose?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXPopover(props: { title?: string; children: React.ReactNode; style?: React.CSSProperties }): JSX.Element;
export function OXAccordion(props: { items: { title: React.ReactNode; body: React.ReactNode }[]; multiple?: boolean; defaultOpen?: number[]; style?: React.CSSProperties }): JSX.Element;
export function OXTabset(props: { tabs: { label: string; panel: React.ReactNode }[]; value?: number; onChange?: (i: number) => void; idBase?: string; style?: React.CSSProperties }): JSX.Element;

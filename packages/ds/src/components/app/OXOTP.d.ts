import React from "react";

/**
 * OXOTP — code-entry cells. This file holds the remaining mobile-app pieces:
 * OXOTP, OXStepper, OXNotif, OXMessage, OXComposer, OXTxRow, OXMintState,
 * OXAvatarStack, OXAppBanner, OXSkeleton, OXOnboardSlide (components.css §10).
 */
export interface OXOTPProps { length: number; value?: string; style?: React.CSSProperties; }
export function OXOTP(props: OXOTPProps): JSX.Element;
export function OXStepper(props: { value: number; min?: number; max?: number; onChange: (v: number) => void; style?: React.CSSProperties }): JSX.Element;
export function OXNotif(props: { body: React.ReactNode; time: string; unread?: boolean; style?: React.CSSProperties }): JSX.Element;
export function OXMessage(props: { direction: "in" | "out"; text: string; time?: string; style?: React.CSSProperties }): JSX.Element;
export function OXComposer(props: { placeholder?: string; value?: string; onChange?: (v: string) => void; onSend?: (v: string) => void; style?: React.CSSProperties }): JSX.Element;
export function OXTxRow(props: { title: string; sub?: string; amount: string; incoming?: boolean; style?: React.CSSProperties }): JSX.Element;
export function OXMintState(props: { status?: "pending" | "done" | "error"; title: React.ReactNode; sub?: string; style?: React.CSSProperties }): JSX.Element;
export function OXAvatarStack(props: { initials: string[]; max?: number; style?: React.CSSProperties }): JSX.Element;
export function OXAppBanner(props: { label: string; trail?: string; onClick?: () => void; style?: React.CSSProperties }): JSX.Element;
export function OXSkeleton(props: { height?: number; width?: string | number; style?: React.CSSProperties }): JSX.Element;
export function OXOnboardSlide(props: { index: number; total: number; kicker: string; title: React.ReactNode; body?: string; action?: React.ReactNode; style?: React.CSSProperties }): JSX.Element;

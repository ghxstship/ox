"use client";
// OX web — booking-gate badge. The DS has no OXGate primitive, so per the design
// constraint we compose it from OXChip (copper-keyed, mono caps). State by
// text + icon, never hue alone. Five states: included · credit · dropin ·
// locked · overlimit (11 §A·6 / §E).
import { OXChip, OXIcon } from "@ox/ds";

export type GateState = "included" | "credit" | "dropin" | "locked" | "overlimit";

const cfg: Record<GateState, { icon: Parameters<typeof OXIcon>[0]["name"]; variant: "oxide" | "oxide-line" | "ghost" }> = {
  included: { icon: "check", variant: "oxide" },
  credit: { icon: "wallet", variant: "oxide-line" },
  dropin: { icon: "ticket", variant: "oxide-line" },
  locked: { icon: "lock", variant: "ghost" },
  overlimit: { icon: "minus", variant: "ghost" },
};

export function OXGate({ state, label }: { state: GateState; label: string }) {
  const c = cfg[state];
  return (
    <OXChip variant={c.variant}>
      <OXIcon name={c.icon} size="sm" /> {label}
    </OXChip>
  );
}

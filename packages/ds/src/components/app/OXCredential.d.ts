import React from "react";

/**
 * OXCredential — the OX membership credential (NFT + physical). The one
 * component allowed gradients + the card radius. Use for the Wallet tab,
 * member profiles, and at-door verification.
 */
export interface OXCredentialProps {
  /** "physical" = oxidized copper plate; "digital" = on-chain NFT card. */
  material?: "physical" | "digital";
  /** Member number, e.g. "014". */
  memberNumber: string;
  /** Field rows (label/value). Wrap value emphasis in <em> for serif-Oxide. */
  fields: { label: string; value: React.ReactNode }[];
  /** Bottom strip — physical: motto; digital: contract + verify URL. */
  strip?: string;
  /** Digital only — shows the "VERIFIED ON-CHAIN" live indicator. */
  verified?: boolean;
  style?: React.CSSProperties;
}
export function OXCredential(props: OXCredentialProps): JSX.Element;

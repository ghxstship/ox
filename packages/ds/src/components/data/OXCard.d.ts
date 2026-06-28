import React from "react";

/**
 * OXCard — the workhorse event/object card: day-tag, category, serif title,
 * description, ruled foot with status + meta. Wrap title emphasis in <em>.
 */
export interface OXCardProps {
  /** Mono day-tag, e.g. "Sat · Mar 14". */
  day?: string;
  category?: React.ReactNode;
  /** Serif title; wrap emphasis in <em> for Oxide italic. */
  title: React.ReactNode;
  description?: string;
  /** Mono foot-left. */
  status?: string;
  /** Foot-right (e.g. an OXChip). */
  meta?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function OXCard(props: OXCardProps): JSX.Element;

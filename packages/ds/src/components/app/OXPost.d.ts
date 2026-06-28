import React from "react";

/** OXPost — social feed post (avatar, author, body, media, actions). */
export interface OXPostProps {
  author: string;
  /** "@mariana · Founder 014" */
  handle: string;
  /** "2H" */
  time?: string;
  body?: string;
  media?: boolean;
  liked?: boolean;
  likes?: number;
  comments?: number;
  style?: React.CSSProperties;
}
export function OXPost(props: OXPostProps): JSX.Element;

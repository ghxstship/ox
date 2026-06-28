import React from "react";

/**
 * OXPost — a social feed post. Oxide monogram avatar, serif author (<em> for
 * Oxide), mono handle/time, body, optional media, like/comment/repost actions.
 */
export function OXPost({ author, handle, time, body, media = false, liked = false, likes, comments, style, ...rest }) {
  const initial = (author || "O").trim().charAt(0).toUpperCase();
  return (
    <article className="ox-post" style={style} {...rest}>
      <div className="ox-post__head">
        <div className="ox-avatar">{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ox-post__name">{author}</div>
          <div className="ox-post__meta">{handle}{time ? " · " + time : ""}</div>
        </div>
      </div>
      {body && <p className="ox-post__body">{body}</p>}
      {media && <div className="ox-post__media"></div>}
      <div className="ox-post__actions">
        <span className={"ox-post__action" + (liked ? " is-on" : "")}>
          <OXPostIcon d="M12 20 C5 15 3 11 3 8 A4 4 0 0 1 12 6 A4 4 0 0 1 21 8 C21 11 19 15 12 20 Z" />
          {likes ?? 0}
        </span>
        <span className="ox-post__action">
          <OXPostIcon d="M4 5 H20 V16 H10 L5 20 V16 H4 Z" />
          {comments ?? 0}
        </span>
        <span className="ox-post__action">
          <OXPostIcon d="M5 9 V7 H17 M17 4 L20 7 L17 10 M19 15 V17 H7 M7 20 L4 17 L7 14" />
          Repost
        </span>
      </div>
    </article>
  );
}

/* Inline OX line icon (like · comment · repost) — line only, 1.5 stroke, no
   fill, currentColor. Mirrors OXIcon paths so OXPost stays self-contained and
   on the icon contract (no filled-heart / dingbat glyphs). */
function OXPostIcon({ d }) {
  return (
    <svg className="ox-ic ox-ic--sm" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

import React from "react";

/**
 * OXProse — long-form reading wrapper (~640px measure, serif headings,
 * Oxide-italic <em>, ruled blockquote/lists). Pass raw markup as children.
 */
export function OXProse({ children, style, ...rest }) {
  return (
    <div className="ox-prose" style={style} {...rest}>
      {children}
    </div>
  );
}

/** OXPullquote — ruled top/bottom italic pullquote. Wrap accent words in <b>. */
export function OXPullquote({ children, style, ...rest }) {
  return (
    <div className="ox-pullquote" style={style} {...rest}>
      {children}
    </div>
  );
}

/** OXFigure — media block + mono caption (— prefixed). */
export function OXFigure({ caption, children, style, ...rest }) {
  return (
    <figure className="ox-figure" style={style} {...rest}>
      {children || <div className="ox-figure__media" />}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** OXReadMore — italic serif link with a trailing arrow. */
export function OXReadMore({ href, children, style, ...rest }) {
  return (
    <a className="ox-readmore" href={href} style={style} {...rest}>
      {children}
    </a>
  );
}

/** OXArticleHeader — kicker + serif title (<em> for Oxide) + mono byline. */
export function OXArticleHeader({ kicker, title, byline = [], style, ...rest }) {
  return (
    <header className="ox-article__head" style={style} {...rest}>
      <div className="ox-article__kicker">— {kicker}</div>
      <h1 className="ox-article__title">{title}</h1>
      {byline.length > 0 && (
        <div className="ox-article__byline">
          {byline.map((b, i) => <span key={i}>{b}</span>)}
        </div>
      )}
    </header>
  );
}

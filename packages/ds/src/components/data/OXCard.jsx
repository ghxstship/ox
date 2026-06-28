import React from "react";

/**
 * OXCard — the event/object card. Mono day-tag + category head, serif title
 * (wrap emphasis in <em> for Oxide italic), description, ruled foot.
 */
export function OXCard({ day, category, title, description, status, meta, onClick, style, ...rest }) {
  return (
    <div className="ox-card" onClick={onClick} style={style} {...rest}>
      {(day || category) && (
        <div className="ox-card__head">
          {day && <span className="ox-card__day">{day}</span>}
          {category && <span className="ox-card__cat">{category}</span>}
        </div>
      )}
      <div className="ox-card__title">{title}</div>
      {description && <p className="ox-card__desc">{description}</p>}
      {(status || meta) && (
        <div className="ox-card__foot">
          <span className="ox-card__cat">{status}</span>
          <span>{meta}</span>
        </div>
      )}
    </div>
  );
}

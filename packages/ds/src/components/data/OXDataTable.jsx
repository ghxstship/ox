import React from "react";

/**
 * OXDataTable — product-grade data table (sticky head, selectable rows,
 * sortable columns, numeric mono cells). columns: { key, label, numeric?, sortable? }.
 */
export function OXDataTable({ columns, rows, selectable = false, selected = [], sortBy, stickyHeader = false, onSort, onSelect, style, ...rest }) {
  const sel = new Set(selected);
  function toggleRow(i) {
    if (!onSelect) return;
    const next = new Set(sel);
    if (next.has(i)) next.delete(i); else next.add(i);
    onSelect([...next]);
  }
  return (
    <table className="ox-data" style={style} {...rest}>
      <thead>
        <tr>
          {selectable && <th className="sel" />}
          {columns.map((c) => {
            const sorted = sortBy && sortBy.key === c.key;
            return (
              <th
                key={c.key}
                className={(c.numeric ? "num " : "") + (c.sortable ? "is-sortable" : "")}
                aria-sort={sorted ? (sortBy.dir === "asc" ? "ascending" : "descending") : undefined}
                onClick={c.sortable && onSort ? () => onSort(c.key) : undefined}
                style={c.numeric ? { textAlign: "right" } : undefined}
              >
                {c.label}
                {c.sortable && <span className="ox-sort">{sorted ? (sortBy.dir === "asc" ? "↑" : "↓") : "↕"}</span>}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={sel.has(i) ? "is-selected" : ""}>
            {selectable && (
              <td className="sel">
                <span className={"ox-data__check" + (sel.has(i) ? " is-on" : "")} onClick={() => toggleRow(i)} />
              </td>
            )}
            {columns.map((c) => (
              <td key={c.key} className={c.numeric ? "num" : undefined}>{r[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** OXBars — ruled bar chart; the peak (or peakIndex) bar is Oxide. */
export function OXBars({ data, peakIndex, style, ...rest }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const peak = peakIndex != null ? peakIndex : data.reduce((m, d, i, a) => (d.value > a[m].value ? i : m), 0);
  return (
    <div className="ox-bars-wrap" style={style} {...rest}>
      <div className="ox-bars">
        {data.map((d, i) => (
          <div
            key={i}
            className={"ox-bars__bar" + (i === peak ? " is-peak" : "")}
            data-label={d.label}
            style={{ height: (d.value / max) * 100 + "%" }}
          />
        ))}
      </div>
    </div>
  );
}

/** OXSparkline — inline Oxide sparkline. */
export function OXSparkline({ points, width = 120, height = 32, style, ...rest }) {
  const max = Math.max(...points), min = Math.min(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1 || 1);
  const d = points.map((p, i) => `${i * step},${height - ((p - min) / span) * height}`).join(" ");
  return (
    <svg className="ox-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style} {...rest}>
      <polyline points={d} />
    </svg>
  );
}

/** OXLineChart — ruled single-series line chart with dots + baseline. */
export function OXLineChart({ series, labels, width = 320, height = 160, style, ...rest }) {
  const pad = 24;
  const max = Math.max(...series), min = Math.min(...series, 0);
  const span = max - min || 1;
  const step = (width - pad * 2) / (series.length - 1 || 1);
  const xy = series.map((v, i) => [pad + i * step, height - pad - ((v - min) / span) * (height - pad * 2)]);
  const path = xy.map((p) => p.join(",")).join(" ");
  return (
    <svg className="ox-line-chart" width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style} {...rest}>
      <line className="grid" x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} />
      <polyline className="series" points={path} fill="none" />
      {xy.map((p, i) => <circle key={i} className="dot" cx={p[0]} cy={p[1]} r="2.5" />)}
      {labels && labels.map((l, i) => (
        <text key={i} className="axis" x={pad + i * step} y={height - 6} textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

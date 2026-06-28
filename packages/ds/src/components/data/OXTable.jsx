import React from "react";

/**
 * OXTable — mono headers, serif body, italic-Oxide "matter" amounts.
 * columns: { key, label, align?, amount? }. Mark a column's value with
 * <em> to render it as the italic-Oxide matter value.
 */
export function OXTable({ columns, rows, style, ...rest }) {
  return (
    <table className="ox-table" style={style} {...rest}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={c.align === "right" ? { textAlign: "right" } : undefined}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c.key} className={c.amount ? "amt" : undefined}>
                {r[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

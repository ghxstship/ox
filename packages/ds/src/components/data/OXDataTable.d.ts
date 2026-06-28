import React from "react";

export interface OXDataColumn { key: string; label: string; numeric?: boolean; sortable?: boolean; }

/**
 * OXDataTable — product-grade data table (sticky head, selection, sort,
 * numeric mono cells). The data-viz family lives here too: OXBars,
 * OXSparkline, OXLineChart (components.css §14 — ruled, Oxide + neutral).
 */
export interface OXDataTableProps {
  columns: OXDataColumn[];
  rows: Record<string, React.ReactNode>[];
  selectable?: boolean;
  selected?: number[];
  sortBy?: { key: string; dir: "asc" | "desc" };
  stickyHeader?: boolean;
  onSort?: (key: string) => void;
  onSelect?: (rows: number[]) => void;
  style?: React.CSSProperties;
}
export function OXDataTable(props: OXDataTableProps): JSX.Element;
export function OXBars(props: { data: { label: string; value: number }[]; peakIndex?: number; style?: React.CSSProperties }): JSX.Element;
export function OXSparkline(props: { points: number[]; width?: number; height?: number; style?: React.CSSProperties }): JSX.Element;
export function OXLineChart(props: { series: number[]; labels?: string[]; width?: number; height?: number; style?: React.CSSProperties }): JSX.Element;

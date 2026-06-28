import React from "react";

/** OXSegmented — segmented switcher; active segment fills Oxide. */
export interface OXSegmentedProps<T extends string = string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: React.CSSProperties;
}
export function OXSegmented<T extends string = string>(props: OXSegmentedProps<T>): JSX.Element;
